import { json, LoaderFunctionArgs, LoaderFunction, type MetaFunction } from "@remix-run/node";

import { getSupabaseServerClient } from "~/utils/supabase.server";
import GenreDashboard from './dashboards/genreDashboard'
import { useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async ({ request } : LoaderFunctionArgs) => {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);
  const { data: { session } } = await supabase.auth.getSession()
  
  // supabase.functions.invoke('update_genre_backdrops', {
  //   body: {name: 'Functions'},
  // })

  const { data: genres } = await supabase
  .from('genres')
  .select(`*`);

  console.log('loader genres', genres)

  return json({ session, genres }, { headers });
};

export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: "Story Arc | Movie | {Movie ID}" },
    { name: "description", content: "Query-based film search engine" },
  ];
};

export default function Index() {
  const { genres } = useLoaderData<typeof loader>();

  return (
    <GenreDashboard genres={genres} />
  )
}