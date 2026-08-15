// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { makeResponder, corsHeadersFor, logAndSanitize } from "../_shared/cors.ts";
import { checkIpRateLimit, getClientIp } from "../_shared/rate_limit.ts";

interface SessionStartRequest {
  visitor_id?: string;
  language?: "en" | "bn";
  source_page?: string;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  const cors = corsHeadersFor(origin);
  const respond = makeResponder(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  if (req.method !== "POST") {
    return respond({ status: "error", error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRole) {
      return respond({ status: "error", error: "Missing Supabase env vars" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRole);
    const requestId = crypto.randomUUID();

    const clientIp = getClientIp(req);
    const withinLimit = await checkIpRateLimit(supabase, "chat_session_start", clientIp, {
      limit: 15,
      windowSeconds: 600,
    });

    if (!withinLimit) {
      return respond(
        { status: "error", request_id: requestId, error: "Too many requests. Please try again shortly." },
        429
      );
    }

    const payload = (await req.json()) as SessionStartRequest;
    const language = payload.language === "bn" ? "bn" : "en";

    let visitorId = payload.visitor_id;

    if (!visitorId) {
      const { data: visitor, error: visitorError } = await supabase
        .from("visitors")
        .insert({ preferred_language: language, source_page: payload.source_page ?? null })
        .select("id")
        .single();

      if (visitorError || !visitor) {
        const message = logAndSanitize(requestId, "Failed to create visitor", visitorError);
        return respond({ status: "error", request_id: requestId, error: message }, 500);
      }

      visitorId = visitor.id;
    } else {
      await supabase
        .from("visitors")
        .update({ last_seen_at: new Date().toISOString(), preferred_language: language, source_page: payload.source_page ?? null })
        .eq("id", visitorId);
    }

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .insert({ visitor_id: visitorId, channel: "web", status: "open" })
      .select("id")
      .single();

    if (conversationError || !conversation) {
      const message = logAndSanitize(requestId, "Failed to create conversation", conversationError);
      return respond({ status: "error", request_id: requestId, error: message }, 500);
    }

    await supabase.from("chat_events").insert({
      visitor_id: visitorId,
      conversation_id: conversation.id,
      event_name: "chat_session_started",
      event_payload: { source_page: payload.source_page ?? null },
    });

    return respond({
      request_id: requestId,
      status: "ok",
      data: {
        visitor_id: visitorId,
        conversation_id: conversation.id,
        welcome_message: language === "bn"
          ? "স্বাগতম। আমি কীভাবে সাহায্য করতে পারি?"
          : "Welcome! How can I help you today?",
      },
      warnings: [],
    });
  } catch (error) {
    const message = logAndSanitize("unknown", "Unhandled session-start error", error);
    return respond({ status: "error", error: message }, 500);
  }
});
