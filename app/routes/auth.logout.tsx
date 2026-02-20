// app/routes/logout.tsx
import { redirect, type ActionFunctionArgs, type ActionFunction } from "@remix-run/node";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export const action: ActionFunction = async ({ request }: ActionFunctionArgs) => {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);

  await supabase.auth.signOut();

  return redirect("/", { headers });
};