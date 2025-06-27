import { json, LoaderFunctionArgs, LoaderFunction, type MetaFunction } from "@remix-run/node";

import { getSupabaseServerClient } from "~/utils/supabase.server";
import { useLoaderData } from "@remix-run/react";
import DashboardLoggedOut from "./dashboards/loggedOut";
import DashboardLoggedIn from "./dashboards/loggedIn";
import { getMoviesByPopularity, getMoviesByTopRated, getMoviesNowPlaying } from "~/utils/services/external/tmdb/movie-lists";
import { getTrendingMovies, getTrendingPeople, getTrendingTvShows } from "~/utils/services/external/tmdb/trending";
import { getMovieDetailsById } from "~/utils/services/external/tmdb/movies";
import { CollectionItemInterface, CollectionsInterface } from "~/interfaces/collections";

export const loader: LoaderFunction = async ({ request } : LoaderFunctionArgs) => {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);
  const { data: { session } } = await supabase.auth.getSession();

  const { data: collections } = await supabase
    .from('collections')
    .select(`
      *,
      collection_items (
        movie_id,
        position,
        added_at,
        notes,
        source
      )
    `)
    .eq('is_system_generated', true)
    .order('created_at', { ascending: false });
  let collectionsWithMovies: CollectionsInterface[] = [];
  console.log('collections', collections)
  if (collections) {
    const movieIds = Array.from(
      new Set(
        collections
          ?.flatMap(collection => collection.collection_items.map((item: CollectionItemInterface) => item.movie_id)) ?? []
      )
    );

    const movieDataMap = new Map<number, unknown>();

    await Promise.all(
      movieIds.map(async (id) => {
        try {
          const data = await getMovieDetailsById({movie_id: id});
          movieDataMap.set(id, data);
        } catch (err) {
          console.error(`Failed to fetch movie ID ${id}`, err);
        }
      })
    );

    collectionsWithMovies = collections.map((collection) => ({
      ...collection,
      collection_items: collection.collection_items.map((item: CollectionItemInterface) => ({
        ...item,
        movie: movieDataMap.get(item.movie_id) || null,
      }))
    }));
  }

  console.log('movieIds', collectionsWithMovies[0]?.collection_items[1])

  const movieLists = await Promise.all([
    await getMoviesByPopularity({page: 1}),
    await getMoviesNowPlaying(),
    await getMoviesByTopRated({page: 1}),
    await getTrendingMovies({time: 'day'}),
    await getTrendingTvShows({time: 'day'}),
  ]);

  const trendingPeople = await getTrendingPeople({time: 'day'});

  return json({ session, movieLists, trendingPeople, collectionsWithMovies }, { headers });
};

export const meta: MetaFunction = () => {
  return [
    { title: "Story Arc" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};


export default function Index() {
  const { session, movieLists, trendingPeople, collectionsWithMovies } = useLoaderData<typeof loader>();
  console.log('Index session', session)
  if (!session) {
    return (
      <DashboardLoggedOut movieLists={movieLists}/>
    )
  }
  return (
    <DashboardLoggedIn movieLists={movieLists} trendingPeople={trendingPeople} collections={collectionsWithMovies}/>
  );
}