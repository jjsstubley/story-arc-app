import { json, LoaderFunctionArgs } from "@remix-run/node"
import { getSupabaseServerClient } from "~/utils/supabase.server";
import { getTmdbCollectionById } from "~/utils/services/external/tmdb/collections";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const headers = new Headers();
  
  const { collectionId } = params; 
  const supabase = getSupabaseServerClient(request, headers);
  const { data: { user } } = await supabase.auth.getUser()

  if (collectionId && user) {
    // movieDetails = await getMovieDetailsById({movie_id: parseInt(movieId)})
    const collection = await getTmdbCollectionById({ collection_id: parseInt(collectionId) })


    return json({ collection });
  }
}