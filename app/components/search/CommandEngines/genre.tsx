
import { useEffect, useState } from "react";
import { GenreInterface } from "~/interfaces/tmdb/genre";
import { ComboboxItemProp } from "~/components/ui/combobox/interfaces/combobox-item";
import { MultipleCombobox } from "~/components/ui/combobox/multiple";
import { Box, Combobox } from "@chakra-ui/react";

interface ConfigProps { 
  type: string;
  key: string;
  name: string[],
  value: string;
}

const GenreCommandEngine = ({ onSelect, genres, defaults, disabled }: { onSelect: (payload: ConfigProps) => void, genres: GenreInterface[], defaults?: string[], disabled: boolean }) => {
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

  function handleOnSubmit(details: Combobox.ValueChangeDetails | null) { 
    console.log('handleOnSubmit details', details);
    if (details) {
      const transformedValues = details?.items?.map((item) => item.id).join('|') || '';

      const newConfig = {
        type: 'genre',
        key: 'with_genres',
        name: details.value || [],
        value: transformedValues
      };
      console.log('handleOnSubmit config', newConfig);
      onSelect(newConfig);
    }
  }

  return (
    <MultipleCombobox suggestions={genreFields} onSelect={handleOnSubmit} startElement="" placeholder="Genre" defaultOpen={false} defaultTags={defaults} disabled={disabled}>
    {(item) => {
      return (
        <Box display="flex" justifyItems="space-between" width="100%" alignItems="center">
          <Box
            p={2}
            display="flex"
            flexDirection="column"
            rounded="md"
            width="100%"
            color="white"
            cursor="pointer"
          >
            <strong>{item.name}</strong>
          </Box>
        </Box>
      )
    }}
  </MultipleCombobox>
  );
};

export default GenreCommandEngine;