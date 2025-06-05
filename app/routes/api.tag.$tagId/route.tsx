import { json, LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { getMoviesByKeyword } from '~/utils/services/external/tmdb/discover'

export const loader: LoaderFunction = async ({ request, params } : LoaderFunctionArgs) => {
  const { tagId } = params; 
  const url = new URL(request.url);
  const page = url.searchParams.get('page');
  const sort = url.searchParams.get('sort');
  
  if (tagId && page && sort) {

    // Fetch movies for each genre in parallel
    const movies = await getMoviesByKeyword({keyword: parseInt(tagId), page: parseInt(page), sort: sort})
    return json({ movies });
  }

  return json({ });
};