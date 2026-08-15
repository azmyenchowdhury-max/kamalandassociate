// @ts-nocheck
import { makeResponder, corsHeadersFor, logAndSanitize } from "../_shared/cors.ts";
import {
  getSslcommerzConfig,
  isSslcommerzConfigured,
  validateSslcommerzTransaction,
  CONSULTATION_FEE_BDT,
} from "../_shared/sslcommerz.ts";
import { confirmConsultationPaid } from "../_shared/eligibility_client.ts";

const DEFAULT_SITE_BASE_URL = "https://azmyenchowdhury-max.github.io/kamalandassociate";

// SSLCommerz posts back to success_url/fail_url/cancel_url with form fields.
// We redirect the browser to the real consultation page with GET params,
// since the frontend reads the result from the URL's query string.
async function handleGatewayCallback(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const outcome = url.searchParams.get("outcome") || "fail";

  const form = await req.formData().catch(() => new FormData());
  const tranId = String(form.get("tran_id") || "");
  const valId = String(form.get("val_id") || "");
  const returnBase = String(form.get("value_d") || "").trim() || DEFAULT_SITE_BASE_URL;

  const target = new URL(`${returnBase.replace(/\/$/, "")}/consultation.html`);
  target.searchParams.set("status", outcome);
  if (tranId) target.searchParams.set("tran_id", tranId);
  if (valId) target.searchParams.set("val_id", valId);

  return new Response(null, {
    status: 303,
    headers: { Location: target.toString() },
  });
}

// The frontend calls this (JSON POST) after landing back on the page, to
// actually verify the payment server-side before treating it as paid.
async function handleFrontendVerify(req: Request, respond: ReturnType<typeof makeResponder>, requestId: string) {
  const sslConfig = getSslcommerzConfig();
  if (!isSslcommerzConfigured(sslConfig)) {
    return respond({ success: false, error: "Online payment is not configured yet." }, 503);
  }

  const payload = await req.json().catch(() => ({}));
  const transactionId = String(payload.transactionId || "").trim();
  const valId = String(payload.valId || "").trim();
  const clientStatus = String(payload.status || "").trim().toUpperCase();

  if (!transactionId) {
    return respond({ success: false, request_id: requestId, error: "Missing transaction ID." }, 400);
  }

  if (clientStatus !== "VALID" || !valId) {
    // Customer cancelled, or the gateway reported failure before a valid state.
    return respond({ success: true, request_id: requestId, verified: false });
  }

  const validation = await validateSslcommerzTransaction(sslConfig, valId);

  const amountMatches = validation.amount === CONSULTATION_FEE_BDT;
  const currencyMatches = (validation.currency || "").toUpperCase() === "BDT";
  const tranMatches = validation.tranId === transactionId;

  if (!validation.valid || !tranMatches || !amountMatches || !currencyMatches) {
    logAndSanitize(requestId, "Payment validation failed or mismatched", {
      valid: validation.valid,
      tranMatches,
      amountMatches,
      currencyMatches,
      raw: validation.raw,
    });
    return respond({ success: true, request_id: requestId, verified: false });
  }

  const consultationId = validation.valueA || "";
  const email = validation.valueB || "";
  const phone = validation.valueC || "";
  const warnings: string[] = [];

  if (consultationId && email && phone) {
    const confirmResult = await confirmConsultationPaid({ email, phone, consultationId });
    if (!confirmResult.success) {
      logAndSanitize(requestId, "Failed to mark consultation as paid after valid payment", confirmResult.error);
      warnings.push("Payment verified, but the booking record could not be updated automatically. Our team will confirm manually.");
    }
  } else {
    warnings.push("Payment verified, but booking details were incomplete. Our team will confirm manually.");
  }

  return respond({
    success: true,
    request_id: requestId,
    verified: true,
    consultation: {
      id: consultationId || null,
      email,
      phone,
    },
    warnings,
  });
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  const cors = corsHeadersFor(origin);
  const respond = makeResponder(origin);
  const requestId = crypto.randomUUID();

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  if (req.method !== "POST") {
    return respond({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    const isGatewayCallback =
      contentType.includes("form-urlencoded") || contentType.includes("multipart/form-data");

    if (isGatewayCallback) {
      return await handleGatewayCallback(req);
    }

    return await handleFrontendVerify(req, respond, requestId);
  } catch (error) {
    const message = logAndSanitize(requestId, "Unhandled payment-verify error", error);
    return respond({ success: false, request_id: requestId, error: message }, 500);
  }
});
