import { ActionFunctionArgs, json, type LoaderFunctionArgs } from "@remix-run/node";
import { addMovieToCollection, isMovieInCollection, removeMovieFromCollection } from "~/utils/services/supabase/collection-items.server";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);
  const { id: collectionId, movieId } = params;

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!collectionId || !movieId) {
    return json({ error: "Collection ID and Movie ID are required" }, { status: 400 });
  }

  const exists = await isMovieInCollection(collectionId, parseInt(movieId), supabase);

  return json({ exists }, { headers });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const headers = new Headers();
  const method = request.method;
  const { id: collectionId, movieId } = params;
  const supabase = getSupabaseServerClient(request, headers);

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!collectionId || !movieId) {
    return json({ error: "Collection ID and Movie ID are required" }, { status: 400 });
  }

  switch (method) {
    case "POST": {
      await addMovieToCollection(collectionId, parseInt(movieId), user.id, supabase);
      return json({ message: "Movie added to collection" }, { status: 201, headers });
    }
    case "DELETE": {
      await removeMovieFromCollection(collectionId, parseInt(movieId), supabase);
      return json({ message: "Movie removed from collection" }, { status: 200, headers });
    }
    default:
      return new Response("Method Not Allowed", { status: 405 });
  }
}



