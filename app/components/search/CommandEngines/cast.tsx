import { AsyncMultipleCombobox } from "~/components/ui/combobox/async-multiple";
import { Box, Combobox } from "@chakra-ui/react";
import { PersonKnownForInterface } from "~/interfaces/tmdb/people";
import { ComboboxItemProp } from "~/components/ui/combobox/interfaces/combobox-item";
import { useEffect, useState } from "react";

interface ConfigProps { 
  type: string;
  key: string;
  name: string[],
  value: string;
}

const CastCommandEngine = ({ people, onSelect, defaults }: { people: PersonKnownForInterface[] ,onSelect: (payload: ConfigProps) => void, defaults?: string[] }) => {
  const [peopleList, setPeopleList] = useState<ComboboxItemProp[]>([]);

  console.log('CastCommandEngine people', people)

  useEffect(() => {
    if (people) {
      setPeopleList(people.map((g: {id: number, name: string}) => ({
        id: g.id,
        name: g.name,
        value: g.name,
      })));
    }
  }, []);

  function handleOnSubmit(details: Combobox.ValueChangeDetails | null) { 
    if (details) {
      const transformedValues = details?.items?.map((item) => item.id).join('|') || '';

      const newConfig = {
        type: 'cast',
        key: 'with_cast',
        name: details.value || [],
        value: transformedValues
      };

      onSelect(newConfig);
    }
  }

  return (
    <AsyncMultipleCombobox suggestions={peopleList} onSelect={handleOnSubmit} startElement="" fetchUrl="/api/cast" placeholder="Cast" defaultOpen={false} colorPalette="blue" defaultTags={defaults}>
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
    </AsyncMultipleCombobox>
  );
};

export default CastCommandEngine;