import { LoaderFunctionArgs, redirect, type LoaderFunction } from "@remix-run/node";
import { getSupabaseServerClient } from "~/utils/supabase.server";

const APP_URL = import.meta.env.VITE_APP_URL;

export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);

  // Normalize the callback URL to avoid double slashes
  const baseUrl = APP_URL?.replace(/\/$/, '') || '';
  const callbackUrl = `${baseUrl}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { 
      redirectTo: callbackUrl,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });

  if (error) {
    return redirect("/auth/login?error=" + encodeURIComponent(error.message));
  }

  if (data?.url) {
    return redirect(data.url, { headers });
  }

  return redirect("/", { headers });
};