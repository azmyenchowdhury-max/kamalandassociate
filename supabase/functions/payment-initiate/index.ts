// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { makeResponder, corsHeadersFor, logAndSanitize } from "../_shared/cors.ts";
import { checkIpRateLimit, getClientIp } from "../_shared/rate_limit.ts";
import {
  getSslcommerzConfig,
  isSslcommerzConfigured,
  initiateSslcommerzSession,
  CONSULTATION_FEE_BDT,
} from "../_shared/sslcommerz.ts";

function siteBaseUrl(): string {
  return (Deno.env.get("SITE_BASE_URL") || "https://azmyenchowdhury-max.github.io/kamalandassociate").replace(/\/$/, "");
}

async function parseRequestBody(req: Request): Promise<Record<string, unknown>> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const dataField = form.get("data");
    const parsed = dataField ? JSON.parse(String(dataField)) : {};
    // NOTE: attached file bytes (file_0, file_1, ...) are not persisted yet —
    // only the JSON metadata (documentsCount/documentNames) carries through.
    // Revisit if document upload during paid booking becomes a real requirement.
    return parsed;
  }

  return await req.json().catch(() => ({}));
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && serviceRole) {
      const supabase = createClient(supabaseUrl, serviceRole);
      const clientIp = getClientIp(req);
      const withinLimit = await checkIpRateLimit(supabase, "payment_initiate", clientIp, {
        limit: 10,
        windowSeconds: 600,
      });

      if (!withinLimit) {
        return respond({ success: false, error: "Too many requests. Please try again shortly." }, 429);
      }
    }

    const sslConfig = getSslcommerzConfig();
    if (!isSslcommerzConfigured(sslConfig)) {
      return respond(
        { success: false, error: "Online payment is not configured yet. Please contact our office to complete booking." },
        503
      );
    }

    const payload = await parseRequestBody(req);

    const email = String(payload.email || "").trim();
    const phone = String(payload.phone || "").trim();
    const firstName = String(payload.firstName || "").trim();
    const lastName = String(payload.lastName || "").trim();
    const consultationId = String(payload.consultationId || "").trim();

    if (!email || !phone || !firstName) {
      return respond({ success: false, error: "Missing required customer details." }, 400);
    }

    const tranId = "KC-PAY-" + Date.now().toString(36).toUpperCase() + "-" + crypto.randomUUID().slice(0, 8).toUpperCase();
    const functionsBase = `${supabaseUrl}/functions/v1`;

    const session = await initiateSslcommerzSession(sslConfig, {
      tranId,
      amount: CONSULTATION_FEE_BDT,
      currency: "BDT",
      successUrl: `${functionsBase}/payment-verify?outcome=success`,
      failUrl: `${functionsBase}/payment-verify?outcome=fail`,
      cancelUrl: `${functionsBase}/payment-verify?outcome=cancel`,
      ipnUrl: `${functionsBase}/payment-ipn`,
      customerName: `${firstName} ${lastName}`.trim(),
      customerEmail: email,
      customerPhone: phone,
      customerAddress: "Dhaka, Bangladesh",
      productName: "Legal Consultation",
      valueA: consultationId,
      valueB: email,
      valueC: phone,
      valueD: siteBaseUrl(),
    });

    if (!session.ok) {
      const message = logAndSanitize(requestId, "SSLCommerz session init failed", session.raw);
      return respond({ success: false, request_id: requestId, error: message }, 502);
    }

    return respond({
      success: true,
      request_id: requestId,
      transactionId: tranId,
      consultationId: consultationId || null,
      gatewayUrl: session.gatewayUrl,
    });
  } catch (error) {
    const message = logAndSanitize(requestId, "Unhandled payment-initiate error", error);
    return respond({ success: false, request_id: requestId, error: message }, 500);
  }
});
