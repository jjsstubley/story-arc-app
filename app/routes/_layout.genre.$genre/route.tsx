import { json, LoaderFunctionArgs, LoaderFunction, type MetaFunction } from "@remix-run/node";

import { getSupabaseServerClient } from "~/utils/supabase.server";
import { useLoaderData } from "@remix-run/react";
import { getOfficialMovieGenres } from "~/utils/services/external/tmdb/genres";
import { getMoviesByGenre } from "~/utils/services/external/tmdb/discover";
import { GenreInterface } from "~/interfaces/genre";
import ReactQueryProvider from "~/components/providers/react-query-provider";
import ResultsLayout from "../_common/results-layout";

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
  

    // Fetch movies for each genre in parallel
    const movies = await getMoviesByGenre({genre: genreObj[0].id, page: 1})
  
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
    <ReactQueryProvider>
      {/* <CategoryDashboard genreList={genreList} /> */}
      <ResultsLayout 
        payload={genreList.movies} 
        title={genreList.genre.name}   
        callback={async (pageParam, sort) => {

          const res = await fetch(`/resources/genre/${genreList.genre.id}?page=${pageParam}&sort=${sort}`);
          const data = await res.json();

          return {
            results: data.movies.results,
            page: data.movies.page,
            total_pages: data.movies.total_pages,
          };
        }}
      />
    </ReactQueryProvider>
  )
}