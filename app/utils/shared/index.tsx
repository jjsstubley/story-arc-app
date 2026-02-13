import { ComboBoxItemProps } from "~/components/search/CommandEngines/interfaces/ComboBoxItem";

export function enforceGenreInFilters(filters: ComboBoxItemProps[], genreName: string, genreId: string): ComboBoxItemProps[] {
  
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