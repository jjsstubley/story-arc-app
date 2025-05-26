import { json } from "@remix-run/node";
import { getOfficialMovieGenres } from "~/utils/services/external/tmdb/genres";

export async function loader() {

  
  const genres = await getOfficialMovieGenres();
  return json(genres);
}