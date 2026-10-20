import { ActionFunction, json } from "@remix-run/node"
import { streamSuggestions } from "~/utils/services/ai/"
import { getSupabaseServerClient } from "~/utils/supabase.server";

function parseExcludeTitles(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string" || !value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === "string") : [];
  } catch {
    return [];
  }
}

function optionalString(value: FormDataEntryValue | null): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const query = formData.get("query");

    // Validate query
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return json({ error: "Query cannot be empty" }, { status: 400 });
    }

    const page = Math.max(1, Number(formData.get("page")) || 1);

    // Get user context for caching and personalisation
    const headers = new Headers({
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache",
    });
    let supabase;
    let user;

    try {
      supabase = getSupabaseServerClient(request, headers);
      const authResult = await supabase.auth.getUser();
      user = authResult.data?.user;
    } catch (authError) {
      console.error("Auth error (continuing without user):", authError);
      // Continue without user context - will still work but won't cache
    }

    const stream = streamSuggestions(
      {
        query: query.trim(),
        page,
        excludeTitles: parseExcludeTitles(formData.get("excludeTitles")),
        aiQueryId: optionalString(formData.get("aiQueryId")),
        collectionId: optionalString(formData.get("collectionId")),
      },
      user?.id,
      user && supabase ? supabase : undefined
    );

    return new Response(stream, { headers });
  } catch (error) {
    console.error("API suggestions error:", error);
    const errorMessage = error instanceof Error
      ? error.message
      : "An unexpected error occurred";
    return json({ error: errorMessage }, { status: 500 });
  }
};
