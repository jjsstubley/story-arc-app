import { json, LoaderFunctionArgs, LoaderFunction, type MetaFunction } from "@remix-run/node";

import { getSupabaseServerClient } from "~/utils/supabase.server";
import { useLoaderData } from "@remix-run/react";
import { getOfficialMovieGenres } from "~/utils/services/external/tmdb/genres";
import { getMoviesByGenre } from "~/utils/services/external/tmdb/discover";
import { GenreInterface } from "~/interfaces/tmdb/genre";
import ReactQueryProvider from "~/components/providers/react-query-provider";
import ResultsLayout from "../_common/results-layout";
import { handleSearchRequest } from "~/utils/loaders/search-request";
import { ComboBoxItemProps } from "~/components/search/CommandEngines/interfaces/ComboBoxItem";

export const loader: LoaderFunction = async ({ request, params } : LoaderFunctionArgs) => {
  const headers = new Headers();
  const { genre } = params; 
  const supabase = getSupabaseServerClient(request, headers);
  const { data: { session } } = await supabase.auth.getSession()
  
  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  if (genre) {
    const [ genres ] = await Promise.all([
      await getOfficialMovieGenres(),
    ]);
  
    const genreObj = genres.genres.filter((i: GenreInterface) => i.name === capitalizeFirstLetter(genre))
  
    // Fetch movies for each genre in parallel
    const movies = await getMoviesByGenre({genre: genreObj[0].id, page: 1})
  
    const genreList = {
      genre: genreObj[0],
      movies
    }
    const {
      results,
      decodedFilters,
      searchParams,
      providers,
      sort,
    } = await handleSearchRequest(request, { includeProviders: true, includeSession: true });
    

    const filters = enforceGenreInFilters(decodedFilters, genreObj[0].name, genreObj[0].id);
  
    return json({ session, results, filters, searchParams, sort, providers, genreList }, { headers });
  }

  return json({ session }, { headers });
};

function enforceGenreInFilters(filters: ComboBoxItemProps[], genreName: string, genreId: string): ComboBoxItemProps[] {
  
  const otherFilters = filters.filter(f => f.type !== 'genre');

  const genreFilter: ComboBoxItemProps = {
    type: 'genre',
    key: 'with_genres',
    name: [genreName],
    value: genreId,
    disabled: true
  };

  return [...otherFilters, genreFilter];
}

export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: "Story Arc | Movie | {Movie ID}" },
    { name: "description", content: "Query-based film search engine" },
  ];
};

export default function Index() {
  const { results, searchParams, filters, sort, genreList } = useLoaderData<typeof loader>();

  return (
    <ReactQueryProvider>
      {/* <CategoryDashboard genreList={genreList} /> */}
      <ResultsLayout 
        payload={results} 
        title={genreList.genre.name}   
        sort_by={sort}
        filters={filters}
        callback={async (pageParam,sort, filters) => {
          const newParams = new URLSearchParams(searchParams);
          const stringifiedFilters = JSON.stringify(filters)
          const serializedFilters = btoa(stringifiedFilters) 
          newParams.set("page", pageParam.toString());
          newParams.set("sort", sort.toString());
          newParams.set('filters', serializedFilters)

          const res = await fetch(`/api/genre/${genreList.genre.id}?${newParams}`);
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