import { createListCollection, Portal, Select, Image, Box, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { FullProviderInterface, WatchProvidersInterface } from "~/interfaces/provider";

interface ProviderItemInterface {
  label: string,
  value: number
}

const ProviderMenu = ({ onChange, providers} : {value: string, onChange: (value: ProviderItemInterface[]) => void, providers: WatchProvidersInterface}) => {
  
  const collection = useMemo(() => {
    return createListCollection({
      items: (providers.results.slice(0, 20) ?? []).map((provider) => ({
        ...provider,
        label: provider.provider_name,
        value: `${provider.provider_id}`, // make sure it's a string
      }))
    })
  }, [providers])
  
  return (
    <Select.Root variant="outline" collection={collection} onValueChange={(e) => {
      console.log('ProviderMenu e.value', e.value)
      const selectedProviders = collection.items.filter(item => e.value.includes(item.value)).map((i) => {
        return {
          value: i.provider_id,
          label: i.provider_name
        }
      });
      onChange(selectedProviders); // pass full objects, or just their ids/names
    }}>
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder="Select a provider" />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {collection.items.map((provider: FullProviderInterface) => (
              <Select.Item item={provider} key={provider.provider_id}>
                <Box display="flex" gap={4} alignContent="center" my={2}>
                  <Image 
                    src={`https://image.tmdb.org/t/p/w300/${provider.logo_path}`}
               
                    rounded="md"
                    fit="cover"
                    width="30px" 
                    height="100%" 
                    objectFit="cover"
                    alt={`${provider.provider_name} logo`}/>
                  <Text fontSize="xs">{provider.provider_name}</Text>
                </Box>
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
};

// const frameworks = createListCollection({
//   items: [
//     { label: "Netflix", value: "netflix" },
//     { label: "Amazon Plus", value: "vote_average.desc" },
//     { label: "Stan", value: "primary_release_date.desc" },
//   ],
// })

export default ProviderMenu;