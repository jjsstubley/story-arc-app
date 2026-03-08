import { ActionFunctionArgs, json } from "@remix-run/node";
import { updateCollectionItem } from "~/utils/services/supabase/collection-items.server";
import { addWatchedMovie } from "~/utils/services/supabase/user-watched-movies.server";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const headers = new Headers();
  const { id: collectionId, movieId } = params;
  const supabase = getSupabaseServerClient(request, headers);

  const { is_watched } = await request.json();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!collectionId || !movieId) {
    return json({ error: "Collection ID and Movie ID are required" }, { status: 400 });
  }

  const movieIdNum = parseInt(movieId);
  const collectionItem = await updateCollectionItem(
    collectionId,
    movieIdNum,
    { is_watched },
    supabase
  );

  if (is_watched === true) {
    await addWatchedMovie(user.id, movieIdNum, supabase);
  }

  return json({ collectionItem }, { headers });
}



