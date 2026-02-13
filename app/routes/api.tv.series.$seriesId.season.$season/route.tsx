import { json, LoaderFunctionArgs } from "@remix-run/node"
  import { getTVSeasonDetailsById } from "~/utils/services/external/tmdb/tv/seasons";

export async function loader({ params }: LoaderFunctionArgs) {
  
  const { seriesId, season } = params; 

  if (seriesId && season) {
    // movieDetails = await getMovieDetailsById({movie_id: parseInt(movieId)})
    const [ movieDetails ] = await Promise.all([
      await getTVSeasonDetailsById({series_id: parseInt(seriesId), season: parseInt(season), append_to_response:['watch/providers', 'videos', 'credits']}),
    ]);

    if (movieDetails["watch/providers"]) {
      movieDetails.providers = movieDetails["watch/providers"];
      delete movieDetails["watch/providers"];
    }

    return json({ movieDetails });
  }
}