import { json, LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { getMoviesByGenre } from '~/utils/services/external/tmdb/discover'

export const loader: LoaderFunction = async ({ request, params } : LoaderFunctionArgs) => {
  const { genreId } = params; 
  const url = new URL(request.url);
  const page = url.searchParams.get('page');
  const sort = url.searchParams.get('sort');
  
  if (genreId && page && sort) {

    // Fetch movies for each genre in parallel
    const movies = await getMoviesByGenre({genre: parseInt(genreId), page: parseInt(page), sort: sort})
    return json({ movies });
  }

  return json({ });
};