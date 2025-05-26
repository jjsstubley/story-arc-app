import { json, LoaderFunctionArgs, LoaderFunction, type MetaFunction, ActionFunction } from "@remix-run/node";

import { getSupabaseServerClient } from "~/utils/supabase.server";
import { getSuggestions } from "~/utils/services/external/openai";
import { SuggestionsDataInterface } from "~/interfaces/suggestions";
import { useLoaderData } from "@remix-run/react";

import ResultsDashboard from "./dashboards/resultsDashboard";
import { getMoviesByAdvancedFilters } from "~/utils/services/external/tmdb/discover";

export const loader: LoaderFunction = async ({ request } : LoaderFunctionArgs) => {
  const headers = new Headers();
  const url = new URL(request.url)
  console.log('LoaderFunction url.searchParams', url.searchParams)
  const query = url.searchParams.get("search");
  const page = url.searchParams.get("page") || "1";
  const chips = Array.from(url.searchParams.entries())
  .filter(([key]) => key.startsWith("chips["))
  .map(([, key]) => {
    const [type, ids] = key.split(":");
    return { type, value: ids }; // You can also split again if needed
  });

  console.log('search/results chips', chips)
  console.log('search/results query', query)

  const supabase = getSupabaseServerClient(request, headers);
  const { data: { session } } = await supabase.auth.getSession()
  
  if (chips && chips.length) {
    const [ results ] = await Promise.all([
      await getMoviesByAdvancedFilters({payload: chips, page: page}),
    ]);
  
    console.log('search/results results', results)
  
    return json({ session, results }, { headers });
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
  const { results } = useLoaderData<typeof loader>();

  return (
    <ResultsDashboard results={results} />
  )
}