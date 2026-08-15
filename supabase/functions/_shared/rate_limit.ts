// deno-lint-ignore no-explicit-any
type SupabaseClient = any;

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") ?? "unknown";
}

// Durable IP-based limiter backed by public.rate_limit_events (service-role only).
export async function checkIpRateLimit(
  supabase: SupabaseClient,
  bucket: string,
  identifier: string,
  opts: { limit: number; windowSeconds: number }
): Promise<boolean> {
  const since = new Date(Date.now() - opts.windowSeconds * 1000).toISOString();

  const { count } = await supabase
    .from("rate_limit_events")
    .select("id", { count: "exact", head: true })
    .eq("bucket", bucket)
    .eq("identifier", identifier)
    .gte("created_at", since);

  if ((count ?? 0) >= opts.limit) {
    return false;
  }

  await supabase.from("rate_limit_events").insert({ bucket, identifier });

  // Cheap best-effort cleanup so this table doesn't grow forever.
  if (Math.random() < 0.02) {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabase.from("rate_limit_events").delete().lt("created_at", cutoff);
  }

  return true;
}

// Durable per-conversation limiter backed by the existing messages table.
export async function checkConversationRateLimit(
  supabase: SupabaseClient,
  conversationId: string,
  opts: { limit: number; windowSeconds: number; messageType?: string }
): Promise<boolean> {
  const since = new Date(Date.now() - opts.windowSeconds * 1000).toISOString();

  let query = supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conversationId)
    .eq("sender", "user")
    .gte("created_at", since);

  if (opts.messageType) {
    query = query.eq("message_type", opts.messageType);
  }

  const { count } = await query;
  return (count ?? 0) < opts.limit;
}
