const ALLOWED_ORIGINS = new Set([
  "https://kamalassociates.com.bd",
  "https://www.kamalassociates.com.bd",
  "http://localhost:8080",
]);

const DEFAULT_ORIGIN = "https://kamalassociates.com.bd";

export function corsHeadersFor(origin: string | null): Record<string, string> {
  const allowOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : DEFAULT_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Vary": "Origin",
  };
}

export function makeResponder(origin: string | null) {
  const headers = corsHeadersFor(origin);
  return (body: unknown, status = 200): Response =>
    new Response(JSON.stringify(body), {
      status,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });
}

// Logs the real error server-side and returns a message safe to show a client.
export function logAndSanitize(requestId: string, context: string, error: unknown): string {
  console.error(`[${requestId}] ${context}:`, error);
  return "Something went wrong on our end. Please try again in a moment.";
}
