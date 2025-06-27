
import { Box, Combobox } from "@chakra-ui/react";
import { CommandCombobox } from "~/components/ui/combobox";

interface ConfigProps { 
  type: string;
  key: string;
  name: string[],
  value: string;
}

const PresetCommandEngine = ({ onSelect, defaults }: { onSelect: (payload: ConfigProps) => void, defaults?: string[] }) => {

  const presets = [
    { id: 1, name: 'Hidden Gems', value: 'Hidden Gems' },
    { id: 2, name: 'Critically Acclaimed', value: 'Critically Acclaimed' },

  ]


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
    <CommandCombobox suggestions={presets} onSelect={handleOnSubmit} startElement="" placeholder="Presets" defaultOpen={false} defaultTags={defaults}>
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
  </CommandCombobox>
  );
};

export default PresetCommandEngine;