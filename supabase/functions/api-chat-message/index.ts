// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

interface ChatMessageRequest {
  conversation_id: string;
  message: string;
  language?: "en" | "bn";
  context?: {
    current_flow?: string;
    prior_slots?: Record<string, string>;
  };
}

function routeIntent(text: string) {
  const normalized = text.toLowerCase();

  if (/(arrest|police|urgent|emergency|custody)/i.test(normalized)) {
    return {
      intent: "emergency",
      confidence: 0.95,
      reply_text: "This seems urgent. Please call our emergency line now or use WhatsApp for immediate support.",
      buttons: [
        { label: "Emergency Call", action: "emergency_call", value: "tel:+8801713456800" },
        { label: "WhatsApp", action: "open_whatsapp", value: "https://wa.me/8801713456800" },
      ],
      escalation_required: true,
    };
  }

  if (/(book|consult|appointment)/i.test(normalized)) {
    return {
      intent: "booking",
      confidence: 0.92,
      reply_text: "I can help you book a consultation. Please share your full name first.",
      buttons: [
        { label: "Start Booking", action: "fill_booking", value: "name" },
      ],
      escalation_required: false,
    };
  }

  if (/(office|address|location|hours)/i.test(normalized)) {
    return {
      intent: "office_info",
      confidence: 0.88,
      reply_text: "Our Dhaka office is at House 78, Road 10, Gulshan-1. Open Sun-Thu, 9:00 AM-7:00 PM.",
      buttons: [
        { label: "Open Map", action: "open_map", value: "https://goo.gl/maps/e1v7wUj9ZoL2" },
      ],
      escalation_required: false,
    };
  }

  if (/(company|register|corporate)/i.test(normalized)) {
    return {
      intent: "service_navigation",
      confidence: 0.85,
      reply_text: "This looks like a corporate law matter. I can guide you to company formation support.",
      buttons: [
        { label: "Corporate Law", action: "service_link", value: "corporate" },
      ],
      escalation_required: false,
    };
  }

  return {
    intent: "legal_guidance",
    confidence: 0.6,
    reply_text: "I can help with legal guidance, consultation booking, FAQs, and document checklists. Could you share a bit more detail?",
    buttons: [],
    escalation_required: false,
  };
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

    const payload = (await req.json()) as ChatMessageRequest;

    if (!payload.conversation_id || !payload.message?.trim()) {
      return jsonResponse({ status: "error", request_id: requestId, error: "conversation_id and message are required" }, 400);
    }

    const response = routeIntent(payload.message);

    const userInsert = await supabase.from("messages").insert({
      conversation_id: payload.conversation_id,
      sender: "user",
      message_type: "text",
      content: payload.message,
      metadata: {
        language: payload.language ?? "en",
        context: payload.context ?? null,
      },
    });

    if (userInsert.error) {
      return jsonResponse({ status: "error", request_id: requestId, error: userInsert.error.message }, 500);
    }

    const botInsert = await supabase.from("messages").insert({
      conversation_id: payload.conversation_id,
      sender: "bot",
      message_type: "text",
      content: response.reply_text,
      metadata: {
        intent: response.intent,
        confidence: response.confidence,
        buttons: response.buttons,
      },
    });

    if (botInsert.error) {
      return jsonResponse({ status: "error", request_id: requestId, error: botInsert.error.message }, 500);
    }

    await supabase
      .from("conversations")
      .update({ current_intent: response.intent })
      .eq("id", payload.conversation_id);

    return jsonResponse({
      request_id: requestId,
      status: "ok",
      data: {
        intent: response.intent,
        confidence: response.confidence,
        reply_text: response.reply_text,
        buttons: response.buttons,
        next_flow: response.intent === "booking" ? "booking_name" : null,
        slot_prompts: response.intent === "booking" ? ["name", "phone", "email", "issue", "date"] : [],
        escalation_required: response.escalation_required,
      },
      warnings: ["Stub intent router in use. Replace routeIntent with production router/RAG."],
    });
  } catch (error) {
    return jsonResponse({ status: "error", error: (error as Error).message }, 500);
  }
});
