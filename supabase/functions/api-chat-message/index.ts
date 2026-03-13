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

const OFFICE_PHONE = "+8801713456800";
const OFFICE_MAP = "https://goo.gl/maps/e1v7wUj9ZoL2";
const OFFICE_WHATSAPP = "https://wa.me/8801713456800";

const INTENTS = new Set([
  "legal_definition",
  "legal_guidance",
  "booking",
  "office_info",
  "service_navigation",
  "emergency",
]);

const SERVICE_IDS = new Set([
  "administrative",
  "corporate",
  "criminal",
  "family",
  "immigration",
  "intellectual",
  "property",
  "commercial",
]);

const ACTIONS = new Set([
  "fill_booking",
  "service_link",
  "open_map",
  "open_whatsapp",
  "open_phone",
  "emergency_call",
]);

const PRACTICE_AREA_TO_SERVICE: Record<string, string> = {
  administrative: "administrative",
  corporate: "corporate",
  criminal: "criminal",
  family: "family",
  immigration: "immigration",
  intellectual: "intellectual",
  property: "property",
  commercial: "commercial",
  general: "corporate",
};

function clampConfidence(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0.7;
  return Math.min(1, Math.max(0, parsed));
}

function buildSystemInstruction(language: "en" | "bn") {
  const targetLanguage = language === "bn" ? "Bangla" : "English";
  return [
    "You are the legal information assistant for Kamal & Associates, a Bangladesh law firm.",
    "Your job is to provide clear, practical, educational legal information.",
    "For legal term questions (example: acquittal), provide: short definition, why it matters, and one practical example.",
    "For user-specific legal matters, provide high-level guidance and always recommend consulting one of the firm's lawyers.",
    "Do not claim to be giving legal advice and do not guarantee outcomes.",
    "If situation is urgent (arrest, police custody, immediate safety risk), mark escalation_required true.",
    "Respond in " + targetLanguage + ".",
    "Return strict JSON only with this schema:",
    "{",
    '  "intent": "legal_definition|legal_guidance|booking|office_info|service_navigation|emergency",',
    '  "confidence": number,',
    '  "reply_text": string,',
    '  "practice_area": "administrative|corporate|criminal|family|immigration|intellectual|property|commercial|general",',
    '  "buttons": [{"label": string, "action": "fill_booking|service_link|open_map|open_whatsapp|open_phone|emergency_call", "value": string}],',
    '  "escalation_required": boolean',
    "}",
    "Keep buttons relevant and maximum 3.",
  ].join("\n");
}

function extractJsonObject(raw: string): string | null {
  if (!raw) return null;
  const withoutFences = raw.replace(/```json|```/gi, "").trim();
  const first = withoutFences.indexOf("{");
  const last = withoutFences.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return null;
  return withoutFences.slice(first, last + 1);
}

function sanitizeButtons(buttons: unknown[], intent: string, practiceArea: string) {
  const normalized: Array<{ label: string; action: string; value: string }> = [];
  const bookingFields = new Set(["name", "phone", "email", "issue", "date"]);

  for (const item of Array.isArray(buttons) ? buttons : []) {
    if (!item || typeof item !== "object") continue;
    const label = String((item as Record<string, unknown>).label ?? "").trim();
    const action = String((item as Record<string, unknown>).action ?? "").trim();
    const value = String((item as Record<string, unknown>).value ?? "").trim();

    if (!label || !ACTIONS.has(action)) continue;

    if (action === "service_link") {
      const resolved = SERVICE_IDS.has(value)
        ? value
        : (PRACTICE_AREA_TO_SERVICE[practiceArea] ?? "corporate");
      normalized.push({ label: label.slice(0, 40), action, value: resolved });
      continue;
    }

    if (action === "fill_booking") {
      const resolvedField = bookingFields.has(value) ? value : "name";
      normalized.push({ label: label.slice(0, 40), action, value: resolvedField });
      continue;
    }

    if (action === "open_phone" || action === "emergency_call") {
      normalized.push({ label: label.slice(0, 40), action: "open_phone", value: `tel:${OFFICE_PHONE}` });
      continue;
    }

    if (action === "open_whatsapp") {
      normalized.push({ label: label.slice(0, 40), action, value: OFFICE_WHATSAPP });
      continue;
    }

    if (action === "open_map") {
      normalized.push({ label: label.slice(0, 40), action, value: OFFICE_MAP });
      continue;
    }

    normalized.push({ label: label.slice(0, 40), action, value });
    if (normalized.length >= 3) break;
  }

  if (normalized.length > 0) {
    return normalized.slice(0, 3);
  }

  if (intent === "booking") {
    return [{ label: "Start Booking", action: "fill_booking", value: "name" }];
  }

  if (intent === "office_info") {
    return [{ label: "Open Map", action: "open_map", value: OFFICE_MAP }];
  }

  if (intent === "emergency") {
    return [
      { label: "Emergency Call", action: "open_phone", value: `tel:${OFFICE_PHONE}` },
      { label: "WhatsApp", action: "open_whatsapp", value: OFFICE_WHATSAPP },
    ];
  }

  if (intent === "service_navigation") {
    return [{ label: "Relevant Practice Area", action: "service_link", value: PRACTICE_AREA_TO_SERVICE[practiceArea] ?? "corporate" }];
  }

  return [{ label: "Book Consultation", action: "fill_booking", value: "name" }];
}

function appendLegalGuardrails(replyText: string, language: "en" | "bn") {
  const clean = String(replyText || "").trim();

  if (!clean) {
    return language === "bn"
      ? "Ami apnake sohoj legal information dite pari. Apnar bistarito poristhitir jonno amader ekjon lawyer-er sathe consultation korun."
      : "I can provide general legal information. For advice based on your exact facts, please consult one of our lawyers.";
  }

  const disclaimer =
    language === "bn"
      ? "\n\nDisclaimer: Ei uttor shudhu general legal information, eta legal advice noy."
      : "\n\nDisclaimer: This response is general legal information and not legal advice.";

  const cta =
    language === "bn"
      ? "\nApnar case-er poristhiti bujhe sothik poramorsher jonno Kamal & Associates-er ekjon lawyer-er sathe poramorsho korun."
      : "\nFor advice tailored to your facts, please consult one of our lawyers at Kamal & Associates.";

  const hasDisclaimer = /not legal advice|legal information only|legal advice noy/i.test(clean);
  const hasConsultationCta = /consult|consultation|lawyer|attorney|poramorsho/i.test(clean);

  return clean + (hasDisclaimer ? "" : disclaimer) + (hasConsultationCta ? "" : cta);
}

function ruleBasedFallback(text: string, language: "en" | "bn") {
  const normalized = text.toLowerCase();

  if (/(arrest|police|urgent|emergency|custody)/i.test(normalized)) {
    return {
      intent: "emergency",
      confidence: 0.95,
      practice_area: "criminal",
      reply_text:
        language === "bn"
          ? "Eta emergency mone hochhe. Doya kore akhoni amader emergency number-e call korun, ba WhatsApp-e jogajog korun."
          : "This seems urgent. Please call our emergency line now or use WhatsApp for immediate support.",
      buttons: [
        { label: "Emergency Call", action: "open_phone", value: `tel:${OFFICE_PHONE}` },
        { label: "WhatsApp", action: "open_whatsapp", value: OFFICE_WHATSAPP },
      ],
      escalation_required: true,
    };
  }

  if (/(what is|define|definition|meaning|acquittal|bail|injunction)/i.test(normalized)) {
    return {
      intent: "legal_definition",
      confidence: 0.8,
      practice_area: "general",
      reply_text:
        language === "bn"
          ? "Ami legal term-er definition o example dite pari. Apni je term-ta jante chan, seta likhun."
          : "I can explain legal terms with a simple definition and example. Please share the exact term you want to learn.",
      buttons: [{ label: "Book Consultation", action: "fill_booking", value: "name" }],
      escalation_required: false,
    };
  }

  if (/(book|consult|appointment)/i.test(normalized)) {
    return {
      intent: "booking",
      confidence: 0.9,
      practice_area: "general",
      reply_text:
        language === "bn"
          ? "Ami consultation booking-e help korte pari. Apnar full name diye shuru korun."
          : "I can help you book a consultation. Please share your full name first.",
      buttons: [{ label: "Start Booking", action: "fill_booking", value: "name" }],
      escalation_required: false,
    };
  }

  return {
    intent: "legal_guidance",
    confidence: 0.65,
    practice_area: "general",
    reply_text:
      language === "bn"
        ? "Ami general legal information dite pari. Apnar proshno-ta arektu specific kore bolben?"
        : "I can help with general legal guidance. Could you share a bit more detail about your legal matter?",
    buttons: [{ label: "Book Consultation", action: "fill_booking", value: "name" }],
    escalation_required: false,
  };
}

async function generateGroqResponse(params: {
  apiKey: string;
  model: string;
  language: "en" | "bn";
  userMessage: string;
  history: Array<{ sender: string; content: string }>;
}) {
  const historyLines = params.history
    .map((item) => `${item.sender}: ${String(item.content || "").slice(0, 500)}`)
    .join("\n");

  const prompt = [
    "Conversation history:",
    historyLines || "(empty)",
    "",
    "Latest user message:",
    params.userMessage,
    "",
    "Return JSON only.",
  ].join("\n");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      model: params.model,
      messages: [
        {
          role: "system",
          content: buildSystemInstruction(params.language),
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 700,
    }),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`Groq request failed: ${response.status} ${bodyText.slice(0, 300)}`);
  }

  const payload = await response.json();
  const text = String(payload?.choices?.[0]?.message?.content ?? "").trim();

  const jsonBlock = extractJsonObject(text);
  if (!jsonBlock) {
    throw new Error("Groq returned non-JSON output");
  }

  const parsed = JSON.parse(jsonBlock) as Record<string, unknown>;

  const intentRaw = String(parsed.intent ?? "legal_guidance").trim();
  const intent = INTENTS.has(intentRaw) ? intentRaw : "legal_guidance";

  const practiceAreaRaw = String(parsed.practice_area ?? "general").trim();
  const practiceArea = practiceAreaRaw in PRACTICE_AREA_TO_SERVICE ? practiceAreaRaw : "general";

  const replyText = appendLegalGuardrails(String(parsed.reply_text ?? ""), params.language);

  const escalation =
    Boolean(parsed.escalation_required) ||
    intent === "emergency" ||
    /(arrest|police|urgent|emergency|custody)/i.test(params.userMessage);

  const buttons = sanitizeButtons(parsed.buttons as unknown[], intent, practiceArea);

  return {
    intent,
    confidence: clampConfidence(parsed.confidence),
    practice_area: practiceArea,
    reply_text: replyText,
    buttons,
    escalation_required: escalation,
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
    const groqApiKey = Deno.env.get("GROQ_API_KEY") ?? "";
    const groqModel = Deno.env.get("GROQ_MODEL") ?? "llama-3.1-8b-instant";

    if (!supabaseUrl || !serviceRole) {
      return jsonResponse({ status: "error", error: "Missing Supabase env vars" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRole);
    const requestId = crypto.randomUUID();

    const payload = (await req.json()) as ChatMessageRequest;
    const language: "en" | "bn" = payload.language === "bn" ? "bn" : "en";

    if (!payload.conversation_id || !payload.message?.trim()) {
      return jsonResponse({ status: "error", request_id: requestId, error: "conversation_id and message are required" }, 400);
    }

    const userInsert = await supabase.from("messages").insert({
      conversation_id: payload.conversation_id,
      sender: "user",
      message_type: "text",
      content: payload.message,
      metadata: {
        language,
        context: payload.context ?? null,
      },
    });

    if (userInsert.error) {
      return jsonResponse({ status: "error", request_id: requestId, error: userInsert.error.message }, 500);
    }

    const warnings: string[] = [];

    const { data: historyRows, error: historyError } = await supabase
      .from("messages")
      .select("sender, content")
      .eq("conversation_id", payload.conversation_id)
      .order("created_at", { ascending: false })
      .limit(12);

    if (historyError) {
      warnings.push(`History load failed: ${historyError.message}`);
    }

    const history = Array.isArray(historyRows) ? [...historyRows].reverse() : [];

    let response;

    if (groqApiKey) {
      try {
        response = await generateGroqResponse({
          apiKey: groqApiKey,
          model: groqModel,
          language,
          userMessage: payload.message,
          history,
        });
      } catch (error) {
        warnings.push(`Groq fallback active: ${(error as Error).message}`);
        response = ruleBasedFallback(payload.message, language);
        response.reply_text = appendLegalGuardrails(response.reply_text, language);
      }
    } else {
      warnings.push("GROQ_API_KEY is not configured. Rule-based fallback is active.");
      response = ruleBasedFallback(payload.message, language);
      response.reply_text = appendLegalGuardrails(response.reply_text, language);
    }

    const botInsert = await supabase.from("messages").insert({
      conversation_id: payload.conversation_id,
      sender: "bot",
      message_type: "text",
      content: response.reply_text,
      metadata: {
        intent: response.intent,
        confidence: response.confidence,
        practice_area: response.practice_area,
        provider: groqApiKey ? "groq" : "rule-based",
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
        practice_area: response.practice_area,
        next_flow: response.intent === "booking" ? "booking_name" : null,
        slot_prompts: response.intent === "booking" ? ["name", "phone", "email", "issue", "date"] : [],
        escalation_required: response.escalation_required,
      },
      warnings,
    });
  } catch (error) {
    return jsonResponse({ status: "error", error: (error as Error).message }, 500);
  }
});
