import { json, LoaderFunctionArgs, LoaderFunction, type MetaFunction } from "@remix-run/node";

import { getSupabaseServerClient } from "~/utils/supabase.server";
import { useLoaderData } from "@remix-run/react";
import { getMoviesByKeyword } from "~/utils/services/external/tmdb/discover";
// import { GenreInterface } from "~/interfaces/genre";
import TagDashboard from "./dashboards/tagDashboard";
import { getKeywordDetail } from "~/utils/services/external/tmdb/keywords";

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
    <TagDashboard tagList={tagList} />
  )
}