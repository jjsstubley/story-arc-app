import { json, LoaderFunctionArgs, LoaderFunction, type MetaFunction } from "@remix-run/node";

import { getSupabaseServerClient } from "~/utils/supabase.server";
import GenreDashboard from './dashboards/genreDashboard'
import { useLoaderData } from "@remix-run/react";
import { getOfficialMovieGenres } from "~/utils/services/external/tmdb/genres";
import { getMoviesByGenre } from "~/utils/services/external/tmdb/discover";
import { GenreInterface } from "~/interfaces/genre";

export const loader: LoaderFunction = async ({ request } : LoaderFunctionArgs) => {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);
  const { data: { session } } = await supabase.auth.getSession()
  
  const [ genres ] = await Promise.all([
    await getOfficialMovieGenres(),
  ]);


  // Fetch movies for each genre in parallel
  const moviesByGenre = await Promise.all(
    genres.genres.map(async (genre: GenreInterface) => {
      const movies = await getMoviesByGenre({genre: genre.id}); // Replace with your real fetch
      return {
        genre,
        movies,
      };
    })
  );

  return json({ session, moviesByGenre }, { headers });
};

export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: "Story Arc | Movie | {Movie ID}" },
    { name: "description", content: "Query-based film search engine" },
  ];
};

export default function Index() {
  const { moviesByGenre } = useLoaderData<typeof loader>();

  return (
    <GenreDashboard moviesByGenre={moviesByGenre} />
  )
}