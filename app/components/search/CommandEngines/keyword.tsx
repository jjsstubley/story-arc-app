import { AsyncMultipleCombobox } from "~/components/ui/combobox/async-multiple";
import { Box, Combobox } from "@chakra-ui/react";

const KeywordCommandEngine = ({ onSelect, defaults }: { onSelect: (details: Combobox.ValueChangeDetails | null) => void, defaults?: string[] }) => {

  return (
    <AsyncMultipleCombobox suggestions={[]} onSelect={onSelect} startElement="" fetchUrl="/api/keywords" placeholder="Keywords" defaultOpen={false} colorPalette="red" defaultTags={defaults}>
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