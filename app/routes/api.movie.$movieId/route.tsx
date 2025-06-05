import { json, LoaderFunctionArgs } from "@remix-run/node"
import { getMovieDetailsById, getSimilarMoviesById, getMovieReviewsByMovieId, getMovieKeywordsById, getWatchProvidersById, getVideosById, getCreditsByMovieId } from '~/utils/services/external/tmdb/movies'

export async function loader({ params }: LoaderFunctionArgs) {

  const { movieId } = params; 

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

    return json({ movieDetails, similar, reviews, keywords, providers, videos, credits });
  }
}