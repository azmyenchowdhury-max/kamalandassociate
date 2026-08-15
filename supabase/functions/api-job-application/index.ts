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
      // Applications are rare, legitimate events — a tight limit mainly
      // deters scripted spam against the Apps Script backend.
      const withinLimit = await checkIpRateLimit(supabase, "job_application", clientIp, {
        limit: 5,
        windowSeconds: 3600,
      });

      if (!withinLimit) {
        return respond(
          { status: "error", request_id: requestId, error: "Too many submissions. Please try again later." },
          429
        );
      }
    }

    const appsScriptUrl = getRequiredEnv("APPS_SCRIPT_URL");
    const appsScriptSecret = getRequiredEnv("APPS_SCRIPT_SECRET");

    const payload = await req.json().catch(() => null);
    if (!payload || typeof payload !== "object") {
      return respond({ status: "error", request_id: requestId, error: "Invalid application payload" }, 400);
    }

    const url = `${appsScriptUrl}?token=${encodeURIComponent(appsScriptSecret)}`;

    const appsScriptResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    if (!appsScriptResponse.ok) {
      const errorText = await appsScriptResponse.text();
      const message = logAndSanitize(
        requestId,
        `Apps Script request failed with status ${appsScriptResponse.status}`,
        errorText
      );
      return respond({ status: "error", request_id: requestId, error: message }, 502);
    }

    const result = await appsScriptResponse.json().catch(() => ({ status: "ok" }));
    return respond(result, 200);
  } catch (error) {
    const message = logAndSanitize(requestId, "Unhandled job-application error", error);
    return respond({ status: "error", request_id: requestId, error: message }, 500);
  }
});
