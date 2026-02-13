import { json, LoaderFunctionArgs } from "@remix-run/node"
import { getTVSeriesDetailsById } from "~/utils/services/external/tmdb/tv/series";

export async function loader({ params }: LoaderFunctionArgs) {
  
  const { id } = params; 

  if (id) {
    // movieDetails = await getMovieDetailsById({movie_id: parseInt(movieId)})
    const [ movieDetails ] = await Promise.all([
      await getTVSeriesDetailsById({series_id: parseInt(id), append_to_response:['similar', 'reviews', 'keywords', 'watch/providers', 'videos', 'credits']}),
    ]);

    if (movieDetails["watch/providers"]) {
      movieDetails.providers = movieDetails["watch/providers"];
      delete movieDetails["watch/providers"];
    }

    return json({ movieDetails });
  }
}