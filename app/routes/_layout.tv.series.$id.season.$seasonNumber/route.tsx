import { json, LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getSupabaseServerClient } from "~/utils/supabase.server";
import { getWatchedEpisodeNumbersForSeason } from "~/utils/services/supabase/user-watched-tv-episodes.server";
import { getTVSeasonDetailsById } from "~/utils/services/external/tmdb/tv/seasons";
import { getTVSeriesDetailsById } from "~/utils/services/external/tmdb/tv/series";
import SeasonDashboard from "./dashboards/SeasonDashboard";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const headers = new Headers();
  const { id, seasonNumber } = params;
  const supabase = getSupabaseServerClient(request, headers);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return json({ error: "User must be signed in" }, { status: 401 });
  }

  if (!id || !seasonNumber) {
    return json(
      { error: "Series ID and season number are required" },
      { status: 400 }
    );
  }

  const seriesId = parseInt(id, 10);
  const seasonNum = parseInt(seasonNumber, 10);

  if (Number.isNaN(seriesId) || Number.isNaN(seasonNum)) {
    return json({ error: "Invalid ID or season number" }, { status: 400 });
  }

  const [season, series, watchedEpisodeNumbers] = await Promise.all([
    getTVSeasonDetailsById({
      series_id: seriesId,
      season: seasonNum,
      append_to_response: ["watch/providers", "videos", "credits"],
    }),
    getTVSeriesDetailsById({
      series_id: seriesId,
      append_to_response: [],
    }),
    getWatchedEpisodeNumbersForSeason(user.id, seriesId, seasonNum, supabase),
  ]);

  if (!season || !series) {
    return json({ error: "Season or series not found" }, { status: 404 });
  }

  return json(
    {
      series: { id: series.id, name: series.name },
      season,
      watchedEpisodeNumbers: watchedEpisodeNumbers ?? [],
    },
    { headers }
  );
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const title = data?.season?.name
    ? `Story Arc | ${data.series?.name ?? "Series"} | ${data.season.name}`
    : "Story Arc | TV Season";
  return [
    { title },
    { name: "description", content: "TV season details and episodes" },
  ];
};

export default function SeasonRoute() {
  const data = useLoaderData<typeof loader>();

  if (data?.error || !data?.series || !data?.season) {
    return null;
  }

  const { series, season, watchedEpisodeNumbers } = data;

  return (
    <SeasonDashboard
      series={series}
      season={season}
      watchedEpisodeNumbers={watchedEpisodeNumbers ?? []}
    />
  );
}
