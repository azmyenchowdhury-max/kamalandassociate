export interface AttorneyMatch {
  name: string;
  slug: string;
  designation: string | null;
  profile_url: string | null;
}

// Finds the best-available attorney for a practice area, falling back to the
// firm's designated default (Mohammad Mostofa Kamal) when nothing matches.
export async function matchAttorney(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  practiceArea: string
): Promise<AttorneyMatch | null> {
  if (practiceArea && practiceArea !== "general") {
    const { data } = await supabase
      .from("attorneys")
      .select("name, slug, designation, profile_url")
      .eq("is_active", true)
      .eq("availability_status", "available")
      .contains("practice_areas", [practiceArea])
      .order("priority_weight", { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      return data[0] as AttorneyMatch;
    }
  }

  const { data: fallback } = await supabase
    .from("attorneys")
    .select("name, slug, designation, profile_url")
    .eq("is_default_fallback", true)
    .eq("is_active", true)
    .limit(1);

  return fallback && fallback.length > 0 ? (fallback[0] as AttorneyMatch) : null;
}
