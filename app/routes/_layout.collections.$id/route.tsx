import { json, LoaderFunctionArgs, LoaderFunction, type MetaFunction } from "@remix-run/node";

import { getSupabaseServerClient } from "~/utils/supabase.server";
import { useLoaderData } from "@remix-run/react";
import CollectionDashboard from "./dashboards/CollectionDashboard";

import { getCollectionWMoviesById } from "~/utils/services/supabase/collections.server";

export const loader: LoaderFunction = async ({ request, params } : LoaderFunctionArgs) => {
  const headers = new Headers();
  const { id } = params; 
  const supabase = getSupabaseServerClient(request, headers);
  const { data: { session } } = await supabase.auth.getSession()
  const { data: { user } } = await supabase.auth.getUser()

  console.log('LoaderFunction id', id)
  
  if (!id) {
    return json({ error: "Collection ID is required"})
  }

  // Allow logged-out users to access system-generated collections
  // For non-system-generated collections, user must be signed in
  const userId = user?.id || null;
  const collection = await getCollectionWMoviesById(id, userId, supabase)
  console.log('collection', collection)

  if (!collection) {
    return json({ error: "Collection not found or access denied" }, { status: 404, headers });
  }

  // If collection is not system-generated and user is not logged in, deny access
  if (!collection.is_system_generated && !user) {
    return json({ error: "User must be signed in to view this collection" }, { status: 401, headers });
  }

  // If collection is not system-generated and user doesn't own it, deny access
  if (!collection.is_system_generated && user && collection.user_id !== user.id) {
    return json({ error: "Access denied" }, { status: 403, headers });
  }

  return json({ session, collection }, { headers });

};

export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: "Story Arc | Collection | {Collection ID}" },
    { name: "description", content: "Query-based film search engine" },
    // {
    //   rel: "preload",
    //   as: "image",
    //   href: `https://image.tmdb.org/t/p/original/${data.watchlist.details.backdrop_path}`,
    // },
  ];
};

export default function Index() {
  const { collection, error, session } = useLoaderData<typeof loader>();
  
  return (
    <CollectionDashboard collection={collection} error={error} session={session} />
  );
}