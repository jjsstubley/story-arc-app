import { json, LoaderFunctionArgs } from "@remix-run/node"
import { getMovieDetailsById } from '~/utils/services/external/tmdb/movies'

export async function loader({ params }: LoaderFunctionArgs) {
  
  const { movieId } = params; 

  if (movieId) {
    // movieDetails = await getMovieDetailsById({movie_id: parseInt(movieId)})
    const [ movieDetails ] = await Promise.all([
      await getMovieDetailsById({movie_id: parseInt(movieId), append_to_response:['similar', 'reviews', 'keywords', 'watch/providers', 'videos', 'credits']}),
    ]);

    if (movieDetails["watch/providers"]) {
      movieDetails.providers = movieDetails["watch/providers"];
      delete movieDetails["watch/providers"];
    }

    return json({ movieDetails });
  }
}