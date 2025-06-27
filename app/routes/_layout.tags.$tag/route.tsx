import { json, LoaderFunctionArgs, LoaderFunction, type MetaFunction } from "@remix-run/node";

import { getSupabaseServerClient } from "~/utils/supabase.server";
import { useLoaderData } from "@remix-run/react";
import { getMoviesByKeyword } from "~/utils/services/external/tmdb/discover";
// import { GenreInterface } from "~/interfaces/genre";
import { getKeywordDetail } from "~/utils/services/external/tmdb/keywords";
import ReactQueryProvider from "~/components/providers/react-query-provider";
import ResultsLayout from "../_common/results-layout";

export const loader: LoaderFunction = async ({ request, params } : LoaderFunctionArgs) => {
  const headers = new Headers();
  const { tag } = params; 
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const supabase = getSupabaseServerClient(request, headers);
  const { data: { session } } = await supabase.auth.getSession()

  if (id && tag) {
    const [ keyword ] = await Promise.all([
        await getKeywordDetail({ id: id}),
    ]);
  
  
    // Fetch movies for each genre in parallel
    const movies = await getMoviesByKeyword({keyword: parseInt(id)})
  
    const tagList = {
      tag: keyword,
      movies
    }
  
    console.log('moviesByGenre', tagList)
  
  
    return json({ session, tagList }, { headers });
  }

  return json({ session }, { headers });
};

export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: "Story Arc | Movie | {Movie ID}" },
    { name: "description", content: "Query-based film search engine" },
  ];
};

export default function Index() {
  const { tagList } = useLoaderData<typeof loader>();

  return (
    // <TagDashboard tagList={tagList} />
    <ReactQueryProvider>
      <ResultsLayout 
        payload={tagList.movies} 
        title={tagList.tag.name}  
        sort_by={'popularity.desc'} 
        callback={async (pageParam, sort) => {

          const res = await fetch(`/api/tag/${tagList.tag.id}?page=${pageParam}&sort=${sort}`);
          const data = await res.json();

          return {
            results: data.movies.results,
            page: data.movies.page,
            total_pages: data.movies.total_pages,
          };
        }}
      />
  </ReactQueryProvider>
  )
}