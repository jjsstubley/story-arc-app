import { json, LoaderFunction, type MetaFunction } from "@remix-run/node";

import { useLoaderData } from "@remix-run/react";


import { getSupabaseServerClient } from "~/utils/supabase.server";
import { handleGlobalSearchRequest } from "~/utils/loaders/global-search-request";
import SearchOverview from "./dashboard/searchOverview";


export const loader: LoaderFunction = async ({ request }) => {
  const headers = new Headers();

  const supabase = getSupabaseServerClient(request, headers);
  const { data: { session } } = await supabase.auth.getSession()

  const {
    movies,
    tv,
    keywords,
    people,
    collections,
    companies,
    query,
  } = await handleGlobalSearchRequest(request);

  console.log('movies', movies)

  return json({ session, movies, tv, keywords, people, collections, companies, query }, { headers });
};

export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: "Story Arc | Search | Results" },
    { name: "description", content: "Query-based film search engine" },
  ];
};

export default function Index() {
  const { movies, keywords, people, collections, companies, query } = useLoaderData<typeof loader>();

  return (
    <SearchOverview movies={movies} keywords={keywords} people={people} collections={collections} companies={companies} query={query} />
  )
}