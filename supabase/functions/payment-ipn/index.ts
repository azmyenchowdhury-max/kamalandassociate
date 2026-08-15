// @ts-nocheck
import { corsHeadersFor, logAndSanitize } from "../_shared/cors.ts";
import {
  getSslcommerzConfig,
  isSslcommerzConfigured,
  validateSslcommerzTransaction,
  CONSULTATION_FEE_BDT,
} from "../_shared/sslcommerz.ts";
import { confirmConsultationPaid } from "../_shared/eligibility_client.ts";

// SSLCommerz's server-to-server notification — the reliable confirmation
// channel, since the browser-redirect flow (payment-verify) can be
// interrupted if the customer closes the tab after paying. This handler is
// idempotent-safe to call even if payment-verify already confirmed the same
// booking (see confirmConsultation's "already confirmed" check in
// EligibilityCode.gs).
Deno.serve(async (req) => {
  const cors = corsHeadersFor(req.headers.get("Origin"));
  const requestId = crypto.randomUUID();

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const sslConfig = getSslcommerzConfig();
    if (!isSslcommerzConfigured(sslConfig)) {
      // Acknowledge with 200 regardless — SSLCommerz retries on non-2xx,
      // and there's nothing useful to do until credentials are set.
      return new Response("ok", { status: 200 });
    }

    const form = await req.formData().catch(() => new FormData());
    const valId = String(form.get("val_id") || "");

    if (!valId) {
      return new Response("Missing val_id", { status: 400 });
    }

    const validation = await validateSslcommerzTransaction(sslConfig, valId);
    const amountMatches = validation.amount === CONSULTATION_FEE_BDT;
    const currencyMatches = (validation.currency || "").toUpperCase() === "BDT";

    if (!validation.valid || !amountMatches || !currencyMatches) {
      logAndSanitize(requestId, "IPN: payment validation failed or mismatched", {
        valid: validation.valid,
        amountMatches,
        currencyMatches,
        raw: validation.raw,
      });
      return new Response("ok", { status: 200 });
    }

    const consultationId = validation.valueA || "";
    const email = validation.valueB || "";
    const phone = validation.valueC || "";

    if (consultationId && email && phone) {
      const confirmResult = await confirmConsultationPaid({ email, phone, consultationId });
      if (!confirmResult.success) {
        logAndSanitize(requestId, "IPN: failed to mark consultation as paid", confirmResult.error);
      }
    } else {
      logAndSanitize(requestId, "IPN: valid payment but missing booking reference values", validation.raw);
    }

    return new Response("ok", { status: 200 });
  } catch (error) {
    logAndSanitize(requestId, "Unhandled payment-ipn error", error);
    // Still 200 — we've logged it; returning an error just makes SSLCommerz retry.
    return new Response("ok", { status: 200 });
  }
});
