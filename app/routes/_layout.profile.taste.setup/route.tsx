import { json, redirect, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { TasteSetup } from "~/features/taste";
import { getSetupPairs, getTastePreferences } from "~/features/taste/index.server";
import { safeRedirectPath } from "~/shared/http/safe-redirect";
import { getOfficialMovieGenres } from "~/utils/services/external/tmdb/genres";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw redirect("/auth/login", { headers });

  const next = safeRedirectPath(new URL(request.url).searchParams.get("next"));
  const [preferences, genres, pairs] = await Promise.all([
    getTastePreferences(user.id, supabase),
    getOfficialMovieGenres(),
    getSetupPairs(),
  ]);
  return json({ preferences, genres: genres?.genres ?? [], pairs, next }, { headers });
};

export const meta: MetaFunction = () => [
  { title: "Set up your taste | Story Arc" },
  { name: "description", content: "Tell us what kinds of stories you love" },
];

export default function TasteSetupRoute() {
  const { preferences, genres, pairs, next } = useLoaderData<typeof loader>();
  return <TasteSetup initialPreferences={preferences} genres={genres} pairs={pairs} next={next} />;
}
