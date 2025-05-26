// app/routes/logout.tsx
import { redirect, type LoaderFunction } from "@remix-run/node";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export const loader: LoaderFunction = async ({ request }) => {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);

  await supabase.auth.signOut();

  return redirect("/", { headers });
};