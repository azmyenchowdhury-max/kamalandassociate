// @ts-nocheck
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return jsonResponse({ status: "error", error: "Method not allowed" }, 405);
  }

  try {
    const airtableToken = getRequiredEnv("AIRTABLE_READ_ONLY_TOKEN");
    const airtableBaseId = getRequiredEnv("AIRTABLE_BASE_ID");
    const airtableTableName = Deno.env.get("AIRTABLE_JOB_POSTINGS_TABLE")?.trim() || "Job Postings";

    const params = new URLSearchParams();
    params.set("view", "Active Postings");
    params.set("filterByFormula", "{Is Active}=1");
    params.set("sort[0][field]", "Posted Date");
    params.set("sort[0][direction]", "desc");

    const airtableUrl = `https://api.airtable.com/v0/${encodeURIComponent(airtableBaseId)}/${encodeURIComponent(airtableTableName)}?${params.toString()}`;

    const airtableResponse = await fetch(airtableUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${airtableToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!airtableResponse.ok) {
      const errorText = await airtableResponse.text();
      return jsonResponse(
        {
          status: "error",
          error: `Airtable request failed with status ${airtableResponse.status}`,
          details: errorText.slice(0, 500),
        },
        502
      );
    }

    const airtablePayload = await airtableResponse.json();
    return jsonResponse(airtablePayload, 200);
  } catch (error) {
    return jsonResponse(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unexpected server error",
      },
      500
    );
  }
});
