import { json, LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { getMoviesByAdvancedFilters } from "~/utils/services/external/tmdb/discover";

export const loader: LoaderFunction = async ({ request } : LoaderFunctionArgs) => {
  const headers = new Headers();
  const url = new URL(request.url)
  console.log('LoaderFunction url.searchParams', url.searchParams)
  const query = url.searchParams.get("search");
  const page = url.searchParams.get("page") || "1";
  const sort = url.searchParams.get("sort") || "popularity.desc";
  const filters = url.searchParams.get("filters");



  console.log('search/results query', query)

  
  if( filters) {
    const decodedFilters = JSON.parse(atob(filters))
    console.log('search/results chips', decodedFilters)

    if (decodedFilters && decodedFilters.length) {
      const [ results ] = await Promise.all([
        await getMoviesByAdvancedFilters({payload: decodedFilters, page: page, sort: sort}),
      ]);
    
      return json({ results, decodedFilters, searchParams: url.searchParams.toString() }, { headers });
    }
  }

  return json({  }, { headers });
};