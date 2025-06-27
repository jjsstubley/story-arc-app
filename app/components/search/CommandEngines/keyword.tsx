import { AsyncMultipleCombobox } from "~/components/ui/combobox/async-multiple";
import { Box, Combobox } from "@chakra-ui/react";

interface ConfigProps { 
  type: string;
  key: string;
  name: string[],
  value: string;
}

const KeywordCommandEngine = ({ onSelect, defaults }: { onSelect: (payload: ConfigProps) => void, defaults?: string[] }) => {

  function handleOnSubmit(details: Combobox.ValueChangeDetails | null) { 
    if (details) {
      const transformedValues = details?.items?.map((item) => item.id).join('|') || '';

      const newConfig = {
        type: 'keywords',
        key: 'with_keywords',
        name: details.value || [],
        value: transformedValues
      };

      onSelect(newConfig);
    }
  }

  return (
    <AsyncMultipleCombobox suggestions={[]} onSelect={handleOnSubmit} startElement="" fetchUrl="/api/keywords" placeholder="Keywords" defaultOpen={false} colorPalette="red" defaultTags={defaults}>
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

export default KeywordCommandEngine;