
import { useEffect, useState } from "react";
import { ComboboxItemProp } from "~/components/ui/combobox/interfaces/combobox-item";
import { MultipleCombobox } from "~/components/ui/combobox/multiple";
import { Box, Combobox } from "@chakra-ui/react";
import { LanguagesInterface } from "~/interfaces/configuration";

const LanguageCommandEngine = ({ onSelect, languages, defaults }: { onSelect: (details: Combobox.ValueChangeDetails | null) => void, languages: LanguagesInterface[], defaults?: string[] }) => {
  const [languageFields, setLanguageFields] = useState<ComboboxItemProp[]>([]);

  useEffect(() => {
    if (languages) {
      setLanguageFields(languages.map((g: LanguagesInterface, index) => ({
        id: index,
        name: g.iso_639_1,
        value: g.english_name,
      })));
    }
  }, []);

  return (
    <MultipleCombobox suggestions={languageFields} onSelect={onSelect} startElement="" placeholder="Language" defaultOpen={false} defaultTags={defaults}>
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
            <strong>{item.value}</strong>
          </Box>
        </Box>
      )
    }}
  </MultipleCombobox>
  );
};

export default LanguageCommandEngine;