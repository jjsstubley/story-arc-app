import { Combobox } from "@chakra-ui/react";
import ConditionCommandEngine from "./condition";
import { useEffect, useState } from "react";
import { GenreInterface } from "~/interfaces/genre";
import { ComboboxItemProp } from "~/components/ui/combobox/interfaces/combobox-item";


type ExtendedValueChangeDetails = Combobox.ValueChangeDetails & {
  conditions: Record<string, string>;
};

const GenreCommandEngine = ({ onSelect, genres }: { onSelect: (details: ExtendedValueChangeDetails | null) => void, genres: GenreInterface[] }) => {
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
    <ConditionCommandEngine suggestions={genreFields} onSelect={onSelect} startElement="with_genres" />
  );
};

export default GenreCommandEngine;