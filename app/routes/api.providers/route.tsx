import { json } from "@remix-run/node"
import { getMovieProviders } from "~/utils/services/external/tmdb/watch-providers"

export async function loader() {

  const data = await getMovieProviders()
  return json(data)
}