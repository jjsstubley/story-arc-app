import { json, LoaderFunctionArgs, LoaderFunction, type MetaFunction } from "@remix-run/node";

import { getSupabaseServerClient } from "~/utils/supabase.server";
import { useLoaderData } from "@remix-run/react";
import HomeDashboard from "./dashboards/home";
import { getMoviesByPopularity, getMoviesByTopRated, getMoviesNowPlaying } from "~/utils/services/external/tmdb/movie-lists";
import { getTrendingMovies, getTrendingPeople, getTrendingTvShows } from "~/utils/services/external/tmdb/trending";
import { getPublicCollectionsWithMovies } from "~/features/collections/index.server";
import { MovieListsInterface } from "~/interfaces/tmdb/movie-lists";
import { TrendingMoviesInterface, TrendingTVSeriesListsInterface } from "~/interfaces/tmdb/trending";

export const loader: LoaderFunction = async ({ request } : LoaderFunctionArgs) => {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);
  const { data: { session } } = await supabase.auth.getSession();

  const collections = await getPublicCollectionsWithMovies(supabase);

  const movieLists = await Promise.all([
    await getMoviesByPopularity({page: 1}),
    await getMoviesNowPlaying(),
    await getMoviesByTopRated({page: 1}),
    await getTrendingMovies({time: 'day'}),
    await getTrendingTvShows({time: 'day'}),
  ]) as [
    MovieListsInterface,
    MovieListsInterface,
    MovieListsInterface,
    TrendingMoviesInterface,
    TrendingTVSeriesListsInterface
  ];

  const trendingPeople = await getTrendingPeople({time: 'day'});

  return json({ session, movieLists, trendingPeople, collections }, { headers });
};

export const meta: MetaFunction = () => {
  return [
    { title: "Story Arc" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};


export default function Index() {
  const { movieLists, trendingPeople, collections } = useLoaderData<typeof loader>();
  return <HomeDashboard movieLists={movieLists} trendingPeople={trendingPeople} collections={collections} />;
}
