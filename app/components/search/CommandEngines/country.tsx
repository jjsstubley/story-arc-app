
import { useEffect, useState } from "react";
import { ComboboxItemProp } from "~/components/ui/combobox/interfaces/combobox-item";
import { MultipleCombobox } from "~/components/ui/combobox/multiple";
import { Box, Combobox } from "@chakra-ui/react";
import { CountriesInterface } from "~/interfaces/configuration";

const CountryCommandEngine = ({ onSelect, countries, defaults }: { onSelect: (details: Combobox.ValueChangeDetails | null) => void, countries: CountriesInterface[], defaults?: string[] }) => {
  const [countryFields, setCountryFields] = useState<ComboboxItemProp[]>([]);

  useEffect(() => {
    if (countries) {
      setCountryFields(countries.map((g: CountriesInterface, index) => ({
        id: index,
        name: g.iso_3166_1,
        value: g.english_name,
      })));
    }
  }, []);

  return (
    <MultipleCombobox suggestions={countryFields} onSelect={onSelect} startElement="" placeholder="Country" defaultOpen={false} defaultTags={defaults}>
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

export default CountryCommandEngine;