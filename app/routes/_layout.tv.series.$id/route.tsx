import { json, LoaderFunctionArgs, LoaderFunction, type MetaFunction } from "@remix-run/node";

import { getSupabaseServerClient } from "~/utils/supabase.server";
import { useLoaderData } from "@remix-run/react";

import { getTVSeriesDetailsById } from "~/utils/services/external/tmdb/tv/series";
import TVSeriesDashboard from "./dashboards/TVSeriesDashboard";

export const loader: LoaderFunction = async ({ request, params } : LoaderFunctionArgs) => {
  const headers = new Headers();
  const { id } = params; 
  const supabase = getSupabaseServerClient(request, headers);
  const { data: { session } } = await supabase.auth.getSession()
  const { data: { user } } = await supabase.auth.getUser()

  console.log('LoaderFunction id', id)
  if (!user) {
    return json({ error: "User must be signed in"})
  }

  if (!id) {
    return json({ error: "Collection ID is required"})
  }

  const series = await getTVSeriesDetailsById({series_id: parseInt(id), append_to_response:['similar', 'reviews', 'keywords', 'watch/providers', 'videos', 'credits']})
  console.log('series', series)

  return json({ session, series }, { headers });

};

export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: "Story Arc | Collection | {Collection ID}" },
    { name: "description", content: "Query-based film search engine" },
    // {
    //   rel: "preload",
    //   as: "image",
    //   href: `https://image.tmdb.org/t/p/original/${data.watchlist.details.backdrop_path}`,
    // },
  ];
};

export default function Index() {
  const { series } = useLoaderData<typeof loader>();
  
  return (
    <TVSeriesDashboard series={series} />
  );
}