import { ActionFunction, json } from "@remix-run/node"
import { getSuggestions } from "~/utils/services/ai/"
import { getSupabaseServerClient } from "~/utils/supabase.server";

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const query = formData.get("query");

    // Validate query
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return json({ error: "Query cannot be empty" }, { status: 400 });
    }

    // Get user context for caching
    const headers = new Headers();
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

    // getSuggestions already returns a Response object, so return it directly
    return await getSuggestions(
      query.trim(),
      user?.id,
      user && supabase ? supabase : undefined,
      {} // context can be extended later with filters, preferences, etc.
    );
  } catch (error) {
    console.error("API suggestions error:", error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : "An unexpected error occurred";
    return json({ error: errorMessage }, { status: 500 });
  }
};