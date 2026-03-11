// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

interface SessionStartRequest {
  visitor_id?: string;
  language?: "en" | "bn";
  source_page?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ status: "error", error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRole) {
      return jsonResponse({ status: "error", error: "Missing Supabase env vars" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRole);
    const requestId = crypto.randomUUID();

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
        return jsonResponse({ status: "error", request_id: requestId, error: visitorError?.message ?? "Failed to create visitor" }, 500);
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
      return jsonResponse({ status: "error", request_id: requestId, error: conversationError?.message ?? "Failed to create conversation" }, 500);
    }

    await supabase.from("chat_events").insert({
      visitor_id: visitorId,
      conversation_id: conversation.id,
      event_name: "chat_session_started",
      event_payload: { source_page: payload.source_page ?? null },
    });

    return jsonResponse({
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
    return jsonResponse({ status: "error", error: (error as Error).message }, 500);
  }
});
