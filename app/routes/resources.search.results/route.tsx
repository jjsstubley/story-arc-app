import { json, LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { getMoviesByAdvancedFilters } from "~/utils/services/external/tmdb/discover";

export const loader: LoaderFunction = async ({ request } : LoaderFunctionArgs) => {
  const headers = new Headers();
  const url = new URL(request.url)
  console.log('LoaderFunction url.searchParams', url.searchParams)
  const query = url.searchParams.get("search");
  const page = url.searchParams.get("page") || "1";
  const sort = url.searchParams.get("sort") || "popularity.desc";
  const chips = Array.from(url.searchParams.entries())
  .filter(([key]) => key.startsWith("chips["))
  .map(([, key]) => {
    const [type, ids] = key.split(":");
    return { type, value: ids }; // You can also split again if needed
  });

  console.log('search/results query', query)

  
  if (chips && chips.length) {
    const [ results ] = await Promise.all([
      await getMoviesByAdvancedFilters({payload: chips, page: page, sort: sort}),
    ]);

  
    return json({ results, chips, searchParams: url.searchParams.toString() }, { headers });
  }

  return json({  }, { headers });
};