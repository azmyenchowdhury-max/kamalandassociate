// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { makeResponder, corsHeadersFor, logAndSanitize } from "../_shared/cors.ts";
import { checkIpRateLimit, getClientIp } from "../_shared/rate_limit.ts";

function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
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
    return respond({ status: "error", error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && serviceRole) {
      const supabase = createClient(supabaseUrl, serviceRole);
      const clientIp = getClientIp(req);
      const withinLimit = await checkIpRateLimit(supabase, "eligibility_check", clientIp, {
        limit: 30,
        windowSeconds: 600,
      });

      if (!withinLimit) {
        return respond(
          { status: "error", request_id: requestId, error: "Too many requests. Please try again shortly." },
          429
        );
      }
    }

    const eligibilityUrl = getRequiredEnv("ELIGIBILITY_API_URL");
    const eligibilityClientKey = getRequiredEnv("ELIGIBILITY_CLIENT_KEY");

    const payload = await req.json().catch(() => null);
    if (!payload || typeof payload !== "object") {
      return respond({ status: "error", request_id: requestId, error: "Invalid request payload" }, 400);
    }

    const forwardBody = { ...payload, clientKey: eligibilityClientKey };

    const eligibilityResponse = await fetch(eligibilityUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(forwardBody),
    });

    if (!eligibilityResponse.ok) {
      const errorText = await eligibilityResponse.text();
      const message = logAndSanitize(
        requestId,
        `Eligibility service failed with status ${eligibilityResponse.status}`,
        errorText
      );
      return respond({ status: "error", request_id: requestId, error: message }, 502);
    }

    const result = await eligibilityResponse.json().catch(() => ({}));
    return respond(result, 200);
  } catch (error) {
    const message = logAndSanitize(requestId, "Unhandled eligibility-check error", error);
    return respond({ status: "error", request_id: requestId, error: message }, 500);
  }
});
