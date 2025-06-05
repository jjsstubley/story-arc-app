import { json, LoaderFunctionArgs } from "@remix-run/node"
import { getMovieBySearchQuery } from "~/utils/services/external/tmdb/search"

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const query = url.searchParams.get("query")
  // const page = Number(url.searchParams.get("page") || 1)

  if (!query) {
    return json({ error: "Missing query" }, { status: 400 })
  }

  const data = await getMovieBySearchQuery({ title: query })
  return json(data)
}