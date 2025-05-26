import { LoaderFunctionArgs, redirect, type LoaderFunction } from "@remix-run/node";
import { getSupabaseServerClient } from "~/utils/supabase.server";

const APP_URL = import.meta.env.VITE_APP_URL;

export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google", // Change to "google", "twitter", etc.
    options: { redirectTo: `${APP_URL}auth/callback` }, // Handle callback
  });

  if (error) {
    return redirect("/auth/login?error=" + encodeURIComponent(error.message));
  }

  return redirect(data.url, { headers });
};