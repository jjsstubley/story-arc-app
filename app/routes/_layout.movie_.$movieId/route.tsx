import { json, LoaderFunctionArgs, LoaderFunction, type MetaFunction } from "@remix-run/node";

import { getSupabaseServerClient } from "~/utils/supabase.server";
import { useLoaderData } from "@remix-run/react";
import MovieDetails from "./dashboards/movieDetails";

import { getCreditsByMovieId, getMovieDetailsById, getMovieKeywordsById, getMovieReviewsByMovieId, getSimilarMoviesById, getVideosById, getWatchProvidersById } from "~/utils/services/external/tmdb/movies";

export const loader: LoaderFunction = async ({ request, params } : LoaderFunctionArgs) => {
  const headers = new Headers();
  const { movieId } = params; 
  const supabase = getSupabaseServerClient(request, headers);
  const { data: { session } } = await supabase.auth.getSession()
  
  if (movieId) {
    // movieDetails = await getMovieDetailsById({movie_id: parseInt(movieId)})
    const [ movieDetails, similar, reviews, keywords, providers, videos, credits ] = await Promise.all([
      await getMovieDetailsById({movie_id: parseInt(movieId)}),
      await getSimilarMoviesById({movie_id: parseInt(movieId), page: 1}),
      await getMovieReviewsByMovieId({movie_id: parseInt(movieId), page: 1}),
      await getMovieKeywordsById({movie_id: parseInt(movieId)}),
      await getWatchProvidersById({movie_id: parseInt(movieId)}),
      await getVideosById({movie_id: parseInt(movieId)}),
      await getCreditsByMovieId({movie_id: parseInt(movieId)})
    ]);

    const movieData = {
      details: movieDetails,
      similar: similar,
      reviews: reviews,
      keywords: keywords,
      providers: providers,
      videos: videos,
      credits: credits
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