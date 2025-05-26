import { json, LoaderFunctionArgs, LoaderFunction, type MetaFunction } from "@remix-run/node";

import { getSupabaseServerClient } from "~/utils/supabase.server";
import { useLoaderData } from "@remix-run/react";
import { getOfficialMovieGenres } from "~/utils/services/external/tmdb/genres";
import { getMoviesByGenre } from "~/utils/services/external/tmdb/discover";
import { GenreInterface } from "~/interfaces/genre";
import CategoryDashboard from "./dashboards/categoryDashboard";

export const loader: LoaderFunction = async ({ request, params } : LoaderFunctionArgs) => {
  const headers = new Headers();
  const { genre } = params; 
  const supabase = getSupabaseServerClient(request, headers);
  const { data: { session } } = await supabase.auth.getSession()
  
  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  if (genre) {
    const [ genres ] = await Promise.all([
      await getOfficialMovieGenres(),
    ]);
  
    const genreObj = genres.genres.filter((i: GenreInterface) => i.name === capitalizeFirstLetter(genre))
  
    console.log('getOfficialMovieGenres genreName', genreObj)
    console.log('getOfficialMovieGenres genre', genre)
  
    // Fetch movies for each genre in parallel
    const movies = await getMoviesByGenre({genre: genreObj[0].id})
  
    const genreList = {
      genre: genreObj[0],
      movies
    }
  
    console.log('moviesByGenre', genreList)
  
  
    return json({ session, genreList }, { headers });
  }

  return json({ session }, { headers });
};

export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: "Story Arc | Movie | {Movie ID}" },
    { name: "description", content: "Query-based film search engine" },
  ];
};

export default function Index() {
  const { genreList } = useLoaderData<typeof loader>();

  return (
    <CategoryDashboard genreList={genreList} />
  )
}