import { json, LoaderFunctionArgs, LoaderFunction, type MetaFunction } from "@remix-run/node";

import { getSupabaseServerClient } from "~/utils/supabase.server";
import { useLoaderData } from "@remix-run/react";
import WatchlistDashboard from "./dashboards/WatchlistDashboard";

import { getDefaultWatchlistWMovies, getWatchlistByIdWMovies } from "~/utils/services/supabase/watchlist.server";
import { getPopcornWatchlistWMovies } from "~/utils/services/cookies/popcorn-watchlist";

export const loader: LoaderFunction = async ({ request, params } : LoaderFunctionArgs) => {
  const headers = new Headers();
  const { id } = params; 
  const supabase = getSupabaseServerClient(request, headers);
  const { data: { session } } = await supabase.auth.getSession()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401, headers });
  }

  if (!id) {
    return json({ error: "Watchlist ID is required" }, { status: 400, headers });
  }

  if (id === 'default') {
    try {
      const watchlist = await getDefaultWatchlistWMovies(user.id, supabase)
      if (!watchlist) {
        return json({ error: "Default watchlist not found", session }, { status: 404, headers });
      }
      return json({ session, watchlist }, { headers });
    } catch (error) {
      console.error('Error loading default watchlist:', error);
      return json({ error: "Failed to load default watchlist", session }, { status: 500, headers });
    }
  }

  if (id === 'popcorn') {
    try {
      const watchlist = await getPopcornWatchlistWMovies(request)
      // getPopcornWatchlistWMovies now always returns a valid watchlist
      return json({ session, watchlist }, { headers });
    } catch (error) {
      console.error('Error loading popcorn watchlist:', error);
      return json({ error: "Failed to load popcorn watchlist", session }, { status: 500, headers });
    }
  }

  // Handle regular watchlist IDs
  try {
    const watchlist = await getWatchlistByIdWMovies(id, user.id, supabase);
    
    if (!watchlist) {
      return json({ error: "Watchlist not found", session }, { status: 404, headers });
    }

    return json({ session, watchlist }, { headers });
  } catch (error) {
    console.error('Error loading watchlist:', error);
    return json({ error: "Failed to load watchlist", session }, { status: 500, headers });
  }
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
  const { watchlist, error } = useLoaderData<typeof loader>();
  
  return (
    <WatchlistDashboard watchlist={watchlist} error={error} />
  );
}