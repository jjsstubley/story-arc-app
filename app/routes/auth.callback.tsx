// app/routes/auth.callback.tsx
import { redirect, type LoaderFunctionArgs, type LoaderFunction } from "@remix-run/node";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'
  const headers = new Headers();

  if(code) {
    const supabase = getSupabaseServerClient(request, headers);
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return redirect(next, { headers })
    }
    
    // If there's an error, redirect to home with error message
    console.error('Auth callback error:', error);
    return redirect("/?error=" + encodeURIComponent(error.message), { headers });
  }

  return redirect("/", { headers }); // Redirect to home page if no code
};