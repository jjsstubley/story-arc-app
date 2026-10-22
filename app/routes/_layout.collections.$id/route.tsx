import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getCollectionWithMovies, requireCollectionIdParam } from "~/features/collections/index.server";
import { getErrorMessage, isAppError } from "~/shared/errors";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import CollectionDashboard from "./dashboards/CollectionDashboard";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);
  const { data: { user } } = await supabase.auth.getUser();

  try {
    // Curated collections work signed out; private ones only for their owner
    const collection = await getCollectionWithMovies(requireCollectionIdParam(params), user?.id ?? null, supabase);
    return json({ collection, viewerId: user?.id ?? null, error: null }, { headers });
  } catch (error) {
    if (!isAppError(error)) console.error("Error loading collection:", error);
    const status = isAppError(error) ? error.status : 500;
    return json(
      { collection: null, viewerId: user?.id ?? null, error: getErrorMessage(error, "Couldn't load this collection.") },
      { status, headers }
    );
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data?.collection ? `${data.collection.name} | Story Arc` : "Collection | Story Arc" },
  { name: "description", content: data?.collection?.description ?? "A film collection on Story Arc" },
];

export default function CollectionRoute() {
  const { collection, viewerId, error } = useLoaderData<typeof loader>();
  return <CollectionDashboard collection={collection} viewerId={viewerId} error={error} />;
}
