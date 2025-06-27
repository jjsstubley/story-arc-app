
import { useEffect, useState } from "react";
import { ComboboxItemProp } from "~/components/ui/combobox/interfaces/combobox-item";
import { MultipleCombobox } from "~/components/ui/combobox/multiple";
import { Box, Combobox } from "@chakra-ui/react";
import { FullProviderInterface } from "~/interfaces/tmdb/provider";

interface ConfigProps { 
  type: string;
  key: string;
  name: string[],
  value: string;
}

const ProviderCommandEngine = ({ onSelect, providers, defaults }: { onSelect: (payload: ConfigProps) => void, providers: FullProviderInterface[], defaults?: string[] }) => {
  const [providerFields, setProviderFields] = useState<ComboboxItemProp[]>([]);

  useEffect(() => {
    if (providers) {
      setProviderFields(providers.map((g: {provider_id: number, provider_name: string}) => ({
        id: g.provider_id,
        name: g.provider_name,
        value: g.provider_name,
      })));
    }
  }, []);

  function handleOnSubmit(details: Combobox.ValueChangeDetails | null) { 
    if (details) {
      const transformedValues = details?.items?.map((item) => item.id).join('|') || '';

      const newConfig = {
        type: 'providers',
        key: 'with_watch_providers',
        name: details.value || [],
        value: transformedValues
      };

      onSelect(newConfig);
    }
  }

  return (
    <MultipleCombobox suggestions={providerFields} onSelect={handleOnSubmit} startElement="" placeholder="Providers" defaultOpen={false} colorPalette="green" defaultTags={defaults}>
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

export default ProviderCommandEngine;