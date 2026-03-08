import { json, redirect, LoaderFunctionArgs, LoaderFunction, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getSupabaseServerClient } from "~/utils/supabase.server";
import { getTVSeriesDetailsById } from "~/utils/services/external/tmdb/tv/series";
import { getWatchedEpisodesForSeries } from "~/utils/services/supabase/user-watched-tv-episodes.server";
import TVSeriesDashboard from "../_layout.tv.series.$id/dashboards/TVSeriesDashboard";

export const loader: LoaderFunction = async ({
  request,
  params,
}: LoaderFunctionArgs) => {
  const headers = new Headers();
  const { id } = params;
  const supabase = getSupabaseServerClient(request, headers);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw redirect("/login");
  }

  if (!id) {
    return json({ error: "Collection ID is required" }, { status: 400 });
  }

  const series = await getTVSeriesDetailsById({
    series_id: parseInt(id),
    append_to_response: [
      "similar",
      "reviews",
      "keywords",
      "watch/providers",
      "videos",
      "credits",
    ],
  });

  const watchedBySeason = await getWatchedEpisodesForSeries(
    user.id,
    series.id,
    supabase
  );

  const seasons = series.seasons ?? [];
  const seasonCompleted: Record<number, boolean> = {};
  for (const season of seasons) {
    const watchedCount = watchedBySeason[season.season_number]?.length ?? 0;
    seasonCompleted[season.season_number] =
      watchedCount === season.episode_count;
  }
  const seasonsCompletedCount = Object.values(seasonCompleted).filter(
    Boolean
  ).length;
  const totalSeasons = seasons.length;

  return json(
    {
      session,
      series,
      watchedBySeason,
      seasonCompleted,
      seasonsCompletedCount,
      totalSeasons,
    },
    { headers }
  );
};

export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: "Story Arc | Collection | {Collection ID}" },
    { name: "description", content: "Query-based film search engine" },
  ];
};

export default function TVSeriesIndex() {
  const data = useLoaderData<typeof loader>();

  if (data?.error || !data?.series) {
    return null;
  }

  const {
    series,
    watchedBySeason,
    seasonCompleted,
    seasonsCompletedCount,
    totalSeasons,
  } = data;

  return (
    <TVSeriesDashboard
      series={series}
      watchedBySeason={watchedBySeason}
      seasonCompleted={seasonCompleted}
      seasonsCompletedCount={seasonsCompletedCount}
      totalSeasons={totalSeasons}
    />
  );
}
