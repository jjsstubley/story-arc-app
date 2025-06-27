import { json, LoaderFunctionArgs, LoaderFunction, type MetaFunction } from "@remix-run/node";

import { getSupabaseServerClient } from "~/utils/supabase.server";
import { useLoaderData } from "@remix-run/react";
import MovieDetails from "./dashboards/movieDetails";

import { getMovieDetailsById } from "~/utils/services/external/tmdb/movies";

export const loader: LoaderFunction = async ({ request, params } : LoaderFunctionArgs) => {
  const headers = new Headers();
  const { movieId } = params; 
  const supabase = getSupabaseServerClient(request, headers);
  const { data: { session } } = await supabase.auth.getSession()
  
  if (movieId) {
    // movieDetails = await getMovieDetailsById({movie_id: parseInt(movieId)})
    const [ movieDetails ] = await Promise.all([
      await getMovieDetailsById({movie_id: parseInt(movieId), append_to_response:['similar', 'reviews', 'keywords', 'watch/providers', 'videos', 'credits']}),
    ]);

    console.log('movieDetails', movieDetails)

    const movieData = {
      details: movieDetails,
    }

    return json({ session, movieData }, { headers });
  }

  return json({ session }, { headers });
};

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [
    { title: "Story Arc | Movie | {Movie ID}" },
    { name: "description", content: "Query-based film search engine" },
    {
      rel: "preload",
      as: "image",
      href: `https://image.tmdb.org/t/p/original/${data.movieData.details.backdrop_path}`,
    },
  ];
};

export default function Index() {
  const { movieData } = useLoaderData<typeof loader>();
  
  return (
    <MovieDetails movieData={movieData} />
  );
}