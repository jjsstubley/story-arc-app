// utils/movie-search.ts
import { getCollectionsBySearchQuery, getCompaniesBySearchQuery, getKeywordBySearchQuery, getMovieBySearchQuery, getPersonBySearchQuery, getTVBySearchQuery } from "~/utils/services/external/tmdb/search"; // optional, for main loader

export async function handleGlobalSearchRequest( request: Request ) {
  const url = new URL(request.url);

  const query = url.searchParams.get("q");

  const [movies, tv, keywords, people, collections, companies] = await Promise.all([
    await getMovieBySearchQuery({ title: query || '' }),
    await getTVBySearchQuery({ title: query || '' }),
    await getKeywordBySearchQuery({ query: query || '', page: 1 }),
    await getPersonBySearchQuery({ query: query || '', page: 1 }),
    await getCollectionsBySearchQuery({ query: query || '', page: 1 }),
    await getCompaniesBySearchQuery({ query: query || '', page: 1 }),
  ])

  return {
    movies,
    tv,
    keywords,
    people,
    collections,
    companies,
    query,
  };
}