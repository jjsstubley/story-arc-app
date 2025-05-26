import { json, LoaderFunctionArgs, LoaderFunction, type MetaFunction } from "@remix-run/node";

import { getSupabaseServerClient } from "~/utils/supabase.server";
import { useLoaderData } from "@remix-run/react";
import DashboardLoggedOut from "./dashboards/loggedOut";
import DashboardLoggedIn from "./dashboards/loggedIn";
import { getMoviesByPopularity, getMoviesByTopRated, getMoviesNowPlaying } from "~/utils/services/external/tmdb/movie-lists";
import { getTrendingMovies, getTrendingTvShows } from "~/utils/services/external/tmdb/trending";

export const loader: LoaderFunction = async ({ request } : LoaderFunctionArgs) => {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);
  const { data: { session } } = await supabase.auth.getSession();

  const movieLists = await Promise.all([
    await getMoviesByPopularity({page: 1}),
    await getMoviesNowPlaying(),
    await getMoviesByTopRated({page: 1}),
    await getTrendingMovies({time: 'day'}),
    await getTrendingTvShows({time: 'day'})
  ]);

  return json({ session, movieLists }, { headers });
};

export const meta: MetaFunction = () => {
  return [
    { title: "StoryARC" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};


export default function Index() {
  const { session, movieLists } = useLoaderData<typeof loader>();

  if (!session) {
    return (
      <DashboardLoggedOut />
    )
  }
  return (
    <DashboardLoggedIn movieLists={movieLists}/>
  );
}