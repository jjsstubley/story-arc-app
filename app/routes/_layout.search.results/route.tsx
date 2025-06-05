import { json, LoaderFunctionArgs, LoaderFunction, type MetaFunction } from "@remix-run/node";

import { getSupabaseServerClient } from "~/utils/supabase.server";
import { useLoaderData } from "@remix-run/react";

import { getMoviesByAdvancedFilters } from "~/utils/services/external/tmdb/discover";
import ResultsLayout from "../_common/results-layout";
import ReactQueryProvider from "~/components/providers/react-query-provider";
import { getMovieProviders } from "~/utils/services/external/tmdb/watch-providers";


export const loader: LoaderFunction = async ({ request } : LoaderFunctionArgs) => {
  const headers = new Headers();
  const url = new URL(request.url)
  console.log('LoaderFunction url.searchParams', url.searchParams)
  const query = url.searchParams.get("search");
  const page = url.searchParams.get("page") || "1";
  const sort = url.searchParams.get("sort") || "popularity.desc";
  const filters = url.searchParams.get("filters");

  console.log('search/results query', query)
  console.log('search/results filters', filters)

  const supabase = getSupabaseServerClient(request, headers);
  const { data: { session } } = await supabase.auth.getSession()
  if( filters) {
    const decodedFilters = JSON.parse(atob(filters))
    console.log('search/results chips', decodedFilters)

    if (decodedFilters && decodedFilters.length) {
      const [ results ] = await Promise.all([
        await getMoviesByAdvancedFilters({payload: decodedFilters, page: page, sort: sort}),
      ]);
  
      const providers = await getMovieProviders()
  
    
      return json({ session, results, decodedFilters, searchParams: url.searchParams.toString(), providers }, { headers });
    }
  }


  return json({ session }, { headers });
};

export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: "Story Arc | Search | Results" },
    { name: "description", content: "Query-based film search engine" },
  ];
};

export default function Index() {
  const { results, searchParams, decodedFilters } = useLoaderData<typeof loader>();

  return (
    <ReactQueryProvider>
      <ResultsLayout 
        payload={results} 
        title={`Results for: `} 
        filters={decodedFilters}  
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