// utils/movie-search.ts
import { getMoviesByAdvancedFilters } from "~/utils/services/external/tmdb/discover";
import { decodeValues } from "../helpers";

export async function handleSearchLists(filters: string) {

  let decodedFilters = [];
  if (filters) {
    decodedFilters = decodeValues(filters);
  }

  console.log('handleSearchLists decodedFilters', decodedFilters)

  const [popular, recent, highest_grossing, highest_rated, most_rated] = await Promise.all([
    getMoviesByAdvancedFilters({ payload: decodedFilters, page: '1', sort: 'popularity.desc' }),
    getMoviesByAdvancedFilters({ payload: decodedFilters, page: '1', sort: 'primary_release_date.desc' }),
    getMoviesByAdvancedFilters({ payload: decodedFilters, page: '1', sort: 'revenue.desc' }),
    getMoviesByAdvancedFilters({ payload: decodedFilters, page: '1', sort: 'vote_average.desc' }),
    getMoviesByAdvancedFilters({ payload: decodedFilters, page: '1', sort: 'vote_count.desc' }),
  ])

  const results = {
    popular,
    recent,
    highest_grossing,
    highest_rated,
    most_rated,
  }


  return {
    results,
    decodedFilters,
  };
}