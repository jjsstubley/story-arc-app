// app/routes/auth.callback.tsx
import { redirect, type LoaderFunctionArgs, type LoaderFunction } from "@remix-run/node";
import { setupPath } from "~/features/taste";
import { needsTasteSetup } from "~/features/taste/index.server";
import { safeRedirectPath } from "~/shared/http/safe-redirect";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = safeRedirectPath(requestUrl.searchParams.get('next'))
  const headers = new Headers();

  if(code) {
    const supabase = getSupabaseServerClient(request, headers);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Until they finish or put off the taste setup, send them there first
      const setupNeeded = data.user
        ? await needsTasteSetup(data.user.id, supabase).catch((setupError) => {
            console.error('Taste setup check failed (continuing):', setupError);
            return false;
          })
        : false;
      return redirect(setupNeeded ? setupPath(next) : next, { headers })
    }

    // If there's an error, redirect to home with error message
    console.error('Auth callback error:', error);
    return redirect("/?error=" + encodeURIComponent(error.message), { headers });
  }

  return redirect("/", { headers }); // Redirect to home page if no code
};
