import { json, LoaderFunction, type MetaFunction } from "@remix-run/node";

import { useLoaderData } from "@remix-run/react";

import { getSupabaseServerClient } from "~/utils/supabase.server";
import { handleSearchLists } from "~/utils/loaders/search-lists";
import SearchListView from "./view/seach-list-view";


export const loader: LoaderFunction = async ({ request }) => {
  const headers = new Headers();
  const url = new URL(request.url);
  const filters = url.searchParams.get("filters");

  const supabase = getSupabaseServerClient(request, headers);
  const { data: { session } } = await supabase.auth.getSession()

  const {
    results,
    decodedFilters,

  } = await handleSearchLists(filters || '');

  return json({ session, results, decodedFilters }, { headers });
};

export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: "Story Arc | Search | Results" },
    { name: "description", content: "Query-based film search engine" },
  ];
};

export default function Index() {
  const { results, decodedFilters } = useLoaderData<typeof loader>();
  console.log('SearchLists decodedFilters', decodedFilters);
  return (
      <SearchListView results={results} decodedFilters={decodedFilters} />
  )
}