import { json, LoaderFunctionArgs, LoaderFunction, type MetaFunction, ActionFunction } from "@remix-run/node";

import { getSupabaseServerClient } from "~/utils/supabase.server";
import { getSuggestions } from "~/utils/services/external/openai";
import { SuggestionsDataInterface } from "~/interfaces/suggestions";
import { useLoaderData } from "@remix-run/react";

import { getMoviesByAdvancedFilters } from "~/utils/services/external/tmdb/discover";
import ResultsLayout from "../_common/results-layout";
import ReactQueryProvider from "~/components/providers/react-query-provider";


type Chip = {
  type: "with_keywords" | "with_genres" | "with_cast";
  value: string;
  ids?: string;
};

export const loader: LoaderFunction = async ({ request } : LoaderFunctionArgs) => {
  const headers = new Headers();
  const url = new URL(request.url)
  console.log('LoaderFunction url.searchParams', url.searchParams)
  const query = url.searchParams.get("search");
  const page = url.searchParams.get("page") || "1";
  const sort = url.searchParams.get("sort") || "popularity.desc";
  const chips = Array.from(url.searchParams.entries())
  .filter(([key]) => key.startsWith("chips["))
  .map(([, key]) => {
    const [type, ids, value] = key.split(":");
    return { type, value: ids, name: value }; // You can also split again if needed
  });

  console.log('search/results chips', chips)
  console.log('search/results query', query)

  const supabase = getSupabaseServerClient(request, headers);
  const { data: { session } } = await supabase.auth.getSession()
  
  if (chips && chips.length) {
    const [ results ] = await Promise.all([
      await getMoviesByAdvancedFilters({payload: chips, page: page, sort: sort}),
    ]);
  
    console.log('search/results results', results)
  
    return json({ session, results, chips, searchParams: url.searchParams.toString() }, { headers });
  }

  return json({ session }, { headers });
};

export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: "Story Arc | Search | Results" },
    { name: "description", content: "Query-based film search engine" },
  ];
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const query = formData.get("query");

  if (!query || typeof query !== "string") {
    return json({ error: "Invalid query" }, { status: 400 });
  }

  const response = (await getSuggestions(query));

  const data = await response.json() as SuggestionsDataInterface

  return data
};

export default function Index() {
  const { results, searchParams, chips } = useLoaderData<typeof loader>();

  return (
    <ReactQueryProvider>
      <ResultsLayout 
        payload={results} 
        title={`Results for: ${chips.map((i: Chip)=> i.name)}`}   
        callback={async (pageParam, sort) => {

          const newParams = new URLSearchParams(searchParams);
          newParams.set("page", pageParam.toString());
          newParams.set("sort", sort.toString());

          const res = await fetch(`/resources/search/results?${newParams}`);
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