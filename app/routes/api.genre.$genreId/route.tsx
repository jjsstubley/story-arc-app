import { json, LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { ComboBoxItemProps } from "~/components/search/CommandEngines/interfaces/ComboBoxItem";
import { GenreInterface } from "~/interfaces/tmdb/genre";
import { handleSearchRequest } from "~/utils/loaders/search-request";
import { getOfficialMovieGenres } from "~/utils/services/external/tmdb/genres";

export const loader: LoaderFunction = async ({ request, params } : LoaderFunctionArgs) => {
  const { genreId } = params; 

  console.log("Genre ID:", genreId);

  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  if (genreId) {
    const [ genres ] = await Promise.all([
      await getOfficialMovieGenres(),
    ]);
  
    const genreObj = genres.genres.filter((i: GenreInterface) => i.name === capitalizeFirstLetter(genreId))
  
    // Fetch movies for each genre in parallel
  
    const {
      results,
      decodedFilters,
      searchParams,
    } = await handleSearchRequest(request, { includeProviders: true, includeSession: true });
    

    const filters = enforceGenreInFilters(decodedFilters, genreObj[0].name, genreObj[0].id);
    return json({ results, filters, searchParams,  });
  }

  return json({ });
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