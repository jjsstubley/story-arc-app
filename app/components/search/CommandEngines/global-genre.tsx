import ConditionCommandEngine from "./condition";
import { useEffect, useState } from "react";
import { GenreInterface } from "~/interfaces/genre";
import { ComboboxItemProp } from "~/components/ui/combobox/interfaces/combobox-item";
import { ExtendedValueChangeDetails } from "./interfaces/ExtendedValueChangeDetails";


const GlobalGenreCommandEngine = ({ onSelect, genres }: { onSelect: (details: ExtendedValueChangeDetails | null) => void, genres: GenreInterface[] }) => {
  const [genreFields, setGenreFields] = useState<ComboboxItemProp[]>([]);

  useEffect(() => {
    if (genres) {
      setGenreFields(genres.map((g: {id: number, name: string}) => ({
        id: g.id,
        name: g.name,
        value: g.name,
      })));
    }
  }, []);

  return (
    <ConditionCommandEngine 
      suggestions={genreFields} 
      onSelect={onSelect} 
      startElement="with_genres" 
    />
  );
};

export default GlobalGenreCommandEngine;