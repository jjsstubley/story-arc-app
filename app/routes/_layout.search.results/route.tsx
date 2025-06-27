import { json, LoaderFunction, type MetaFunction } from "@remix-run/node";

import { useLoaderData } from "@remix-run/react";

import ResultsLayout from "../_common/results-layout";
import ReactQueryProvider from "~/components/providers/react-query-provider";

import { handleSearchRequest } from "~/utils/loaders/search-request";
import { getSupabaseServerClient } from "~/utils/supabase.server";


export const loader: LoaderFunction = async ({ request }) => {
  const headers = new Headers();

  const supabase = getSupabaseServerClient(request, headers);
  const { data: { session } } = await supabase.auth.getSession()

  const {
    results,
    decodedFilters,
    searchParams,
    providers,
    sort,
  } = await handleSearchRequest(request, { includeProviders: true, includeSession: true });

  return json({ session, results, decodedFilters, searchParams, providers, sort }, { headers });
};

export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: "Story Arc | Search | Results" },
    { name: "description", content: "Query-based film search engine" },
  ];
};

export default function Index() {
  const { results, searchParams, decodedFilters, sort } = useLoaderData<typeof loader>();

  return (
    <ReactQueryProvider>
      <ResultsLayout 
        payload={results} 
        title={`Results for: `} 
        filters={decodedFilters}  
        sort_by={sort}
        callback={async (pageParam, sort, filters) => {
          const newParams = new URLSearchParams(searchParams);
          const stringifiedFilters = JSON.stringify(filters)
          const serializedFilters = btoa(stringifiedFilters) 
          newParams.set("page", pageParam.toString());
          newParams.set("sort", sort.toString());
          newParams.set('filters', serializedFilters)

          const res = await fetch(`/api/search/results?${newParams}`);
          const data = await res.json();

          return {
            results: data.results.results,
            page: data.results.page,
            total_pages: data.results.total_pages,
          };
        }}
      />
    </ReactQueryProvider>
  )
}