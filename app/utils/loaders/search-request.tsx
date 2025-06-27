// utils/movie-search.ts
import { getMoviesByAdvancedFilters } from "~/utils/services/external/tmdb/discover";
import { getMovieProviders } from "~/utils/services/external/tmdb/watch-providers"; // optional, for main loader

export async function handleSearchRequest(request: Request, options?: { includeProviders?: boolean, includeSession?: boolean }) {
  const url = new URL(request.url);
//   const query = url.searchParams.get("search");
  const page = url.searchParams.get("page") || "1";
  const sort = url.searchParams.get("sort") || "popularity.desc";
  const filters = url.searchParams.get("filters");

  let decodedFilters = [];
  if (filters) {
    decodedFilters = JSON.parse(atob(filters));
    console.log('Decoded filters:', decodedFilters);
  }

  const resultsPromise = getMoviesByAdvancedFilters({ payload: decodedFilters, page, sort });

  const providersPromise = options?.includeProviders ? getMovieProviders() : Promise.resolve(null);

  const [results, providers] = await Promise.all([
    resultsPromise,
    providersPromise,
  ]);

  return {
    results,
    decodedFilters,
    searchParams: url.searchParams.toString(),
    sort,
    providers,
  };
}