import { json, LoaderFunctionArgs } from "@remix-run/node"
import { getTVEpisodeDetailsById } from "~/utils/services/external/tmdb/tv/episodes";

export async function loader({ params }: LoaderFunctionArgs) {
  
  const { seriesId, season, episode } = params; 

  if (seriesId && season && episode) {
    // movieDetails = await getMovieDetailsById({movie_id: parseInt(movieId)})
    const [ movieDetails ] = await Promise.all([
      await getTVEpisodeDetailsById({series_id: parseInt(seriesId), season: parseInt(season), episode: parseInt(episode), append_to_response:['videos', 'credits']}),
    ]);

    return json({ movieDetails });
  }
}