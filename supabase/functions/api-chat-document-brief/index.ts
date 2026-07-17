// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { matchAttorney } from "../_shared/attorneys.ts";

interface DocumentBriefRequest {
  conversation_id: string;
  document_text: string;
  language?: "en" | "bn";
}

const PRACTICE_AREAS = new Set([
  "administrative",
  "corporate",
  "criminal",
  "family",
  "immigration",
  "intellectual",
  "property",
  "commercial",
  "general",
]);

const MAX_DOCUMENT_CHARS = 12000;

function buildSystemInstruction(language: "en" | "bn") {
  const targetLanguage = language === "bn" ? "Bangla" : "English";
  return [
    "You are a legal document triage assistant for Kamal & Associates, a Bangladesh law firm.",
    "You will receive raw text extracted (via OCR or PDF parsing) from a document a visitor uploaded. The text may contain OCR noise or typos.",
    "Your job: identify what kind of document this is and explain it in plain, non-legal language for someone with no legal literacy.",
    "Do not give legal advice or predict outcomes. Always point the person toward consulting a firm lawyer.",
    "CRITICAL PRIVACY RULE: 'lead_summary' must NEVER contain names, NID numbers, phone numbers, addresses, or any other identifying detail, even if present in the document. Keep it to case type and general situation only.",
    "Respond in " + targetLanguage + " for plain_summary. Keep lead_summary in English regardless, for internal firm records.",
    "Return strict JSON only with this schema:",
    "{",
    '  "document_type": string,',
    '  "plain_summary": string,',
    '  "practice_area": "administrative|corporate|criminal|family|immigration|intellectual|property|commercial|general",',
    '  "urgency_level": "low|medium|high|critical",',
    '  "lead_summary": string,',
    '  "escalation_required": boolean',
    "}",
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

async function analyzeDocument(params: {
  apiKey: string;
  model: string;
  language: "en" | "bn";
  documentText: string;
}) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      model: params.model,
      messages: [
        { role: "system", content: buildSystemInstruction(params.language) },
        { role: "user", content: `Document text:\n\n${params.documentText}\n\nReturn JSON only.` },
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
  if (!jsonBlock) throw new Error("Groq returned non-JSON output");

  const parsed = JSON.parse(jsonBlock) as Record<string, unknown>;
  const practiceAreaRaw = String(parsed.practice_area ?? "general").trim();

  return {
    document_type: String(parsed.document_type ?? "Legal Document").slice(0, 120),
    plain_summary: String(parsed.plain_summary ?? "").trim(),
    practice_area: PRACTICE_AREAS.has(practiceAreaRaw) ? practiceAreaRaw : "general",
    urgency_level: ["low", "medium", "high", "critical"].includes(String(parsed.urgency_level))
      ? String(parsed.urgency_level)
      : "medium",
    lead_summary: String(parsed.lead_summary ?? "").slice(0, 400),
    escalation_required: Boolean(parsed.escalation_required),
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

    if (!groqApiKey) {
      return jsonResponse(
        { status: "error", error: "Document analysis requires GROQ_API_KEY to be configured." },
        503
      );
    }

    const supabase = createClient(supabaseUrl, serviceRole);
    const requestId = crypto.randomUUID();
    const payload = (await req.json()) as DocumentBriefRequest;
    const language: "en" | "bn" = payload.language === "bn" ? "bn" : "en";

    const documentText = String(payload.document_text ?? "").trim();
    if (!payload.conversation_id || !documentText) {
      return jsonResponse(
        { status: "error", request_id: requestId, error: "conversation_id and document_text are required" },
        400
      );
    }

    const truncated = documentText.length > MAX_DOCUMENT_CHARS;
    const clippedText = documentText.slice(0, MAX_DOCUMENT_CHARS);

    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("visitor_id")
      .eq("id", payload.conversation_id)
      .single();

    if (convError || !conversation) {
      return jsonResponse(
        { status: "error", request_id: requestId, error: "Conversation not found" },
        404
      );
    }

    const analysis = await analyzeDocument({
      apiKey: groqApiKey,
      model: groqModel,
      language,
      documentText: clippedText,
    });

    const attorney = await matchAttorney(supabase, analysis.practice_area);

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        visitor_id: conversation.visitor_id,
        conversation_id: payload.conversation_id,
        lead_status: "new",
        case_type: analysis.practice_area,
        urgency_level: analysis.urgency_level,
        issue_summary: `[${analysis.document_type}] ${analysis.lead_summary}`,
        source: "chatbot_document_upload",
      })
      .select("id")
      .single();

    const warnings: string[] = [];
    if (leadError) warnings.push(`Lead save failed: ${leadError.message}`);
    if (truncated) warnings.push("Document text was truncated before analysis (very long document).");

    const replyText =
      analysis.plain_summary ||
      (language === "bn"
        ? "আমি আপনার ডকুমেন্ট পড়েছি, তবে একটি স্পষ্ট সারাংশ তৈরি করতে পারিনি। দয়া করে আমাদের একজন আইনজীবীর সাথে সরাসরি কথা বলুন।"
        : "I read your document but couldn't produce a clear summary. Please speak with one of our lawyers directly.");

    const buttons = [
      { label: "Book Consultation", action: "fill_booking", value: "name" },
    ];
    if (attorney) {
      buttons.push({
        label: `View ${attorney.name}'s Profile`.slice(0, 40),
        action: "open_link",
        value: attorney.profile_url ?? "attorneys.html",
      });
    }
    if (analysis.escalation_required) {
      buttons.push({ label: "WhatsApp Now", action: "open_whatsapp", value: "" });
    }

    await supabase.from("messages").insert({
      conversation_id: payload.conversation_id,
      sender: "bot",
      message_type: "file",
      content: replyText,
      metadata: {
        document_type: analysis.document_type,
        practice_area: analysis.practice_area,
        urgency_level: analysis.urgency_level,
        recommended_attorney: attorney,
        lead_id: lead?.id ?? null,
      },
    });

    return jsonResponse({
      request_id: requestId,
      status: "ok",
      data: {
        document_type: analysis.document_type,
        reply_text: replyText,
        practice_area: analysis.practice_area,
        urgency_level: analysis.urgency_level,
        escalation_required: analysis.escalation_required,
        recommended_attorney: attorney,
        buttons: buttons.slice(0, 3),
      },
      warnings,
    });
  } catch (error) {
    return jsonResponse({ status: "error", error: (error as Error).message }, 500);
  }
});
