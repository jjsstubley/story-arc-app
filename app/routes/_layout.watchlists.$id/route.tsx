import { json, LoaderFunctionArgs, LoaderFunction, type MetaFunction } from "@remix-run/node";

import { getSupabaseServerClient } from "~/utils/supabase.server";
import { useLoaderData, useParams } from "@remix-run/react";
import WatchlistDashboard from "./dashboards/WatchlistDashboard";

import { getPopcornWatchlistWMovies, getWatchlistWMovies } from "~/features/watchlists/index.server";
import { POPCORN_WATCHLIST_ID, useWatchlist } from "~/features/watchlists";
import { getErrorMessage, isAppError } from "~/shared/errors";
import { WatchlistInterface } from "~/interfaces/watchlist";

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

  try {
    // "default" resolves to the user's default list
    const watchlist = id === POPCORN_WATCHLIST_ID
      ? await getPopcornWatchlistWMovies(request)
      : await getWatchlistWMovies(id, user.id, supabase);
    return json({ session, watchlist }, { headers });
  } catch (error) {
    if (!isAppError(error)) console.error('Error loading watchlist:', error);
    const status = isAppError(error) ? error.status : 500;
    return json({ error: getErrorMessage(error, "Failed to load watchlist"), session }, { status, headers });
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
  const { id = "" } = useParams();
  const { watchlist: initialWatchlist, error } = useLoaderData<typeof loader>();
  // Seeded from the loader, then kept current as movies are added or removed anywhere
  const { data: watchlist } = useWatchlist(id, {
    initialData: initialWatchlist as WatchlistInterface | undefined,
    enabled: !error,
  });
  
  return (
    <WatchlistDashboard watchlist={watchlist} error={error} />
  );
}
