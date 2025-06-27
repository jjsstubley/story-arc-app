import { json, LoaderFunctionArgs, LoaderFunction, type MetaFunction } from "@remix-run/node";

import { getSupabaseServerClient } from "~/utils/supabase.server";
import { useLoaderData } from "@remix-run/react";
import WatchlistDashboard from "./dashboards/WatchlistDashboard";

import { getDefaultWatchlistWMovies } from "~/utils/services/supabase/watchlist.server";
import { getPopcornWatchlistWMovies } from "~/utils/services/cookies/popcorn-watchlist";

export const loader: LoaderFunction = async ({ request, params } : LoaderFunctionArgs) => {
  const headers = new Headers();
  const { id } = params; 
  const supabase = getSupabaseServerClient(request, headers);
  const { data: { session } } = await supabase.auth.getSession()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return json({ error: "Watchlist ID is required"})
  }

  if (id === 'default') {
    const watchlist = await getDefaultWatchlistWMovies(user.id, supabase)

    return json({ session, watchlist }, { headers });
  }

  if (id === 'popcorn') {
    const watchlist = await getPopcornWatchlistWMovies(request)

    console.log('watchlist', watchlist)

    return json({ session, watchlist }, { headers });
  }

  return json({ session }, { headers });
};

export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: "Story Arc | Movie | {Movie ID}" },
    { name: "description", content: "Query-based film search engine" },
    // {
    //   rel: "preload",
    //   as: "image",
    //   href: `https://image.tmdb.org/t/p/original/${data.watchlist.details.backdrop_path}`,
    // },
  ];
};

export default function Index() {
  const { watchlist } = useLoaderData<typeof loader>();
  
  return (
    <WatchlistDashboard watchlist={watchlist} />
  );
}