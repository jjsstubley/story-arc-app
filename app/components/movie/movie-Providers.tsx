import { Avatar, Box, Card, HStack, SimpleGrid, Stack, Tabs, Text } from '@chakra-ui/react';
import { CountryResultInterface } from '~/interfaces/tmdb/provider';

type providerKeys = 'buy' | 'rent' | 'flatrate' | 'free';

type providerObjProps = {
    [K in providerKeys]: string;
}

interface providerMapProps {
    key: providerKeys,
    label: string,
}


const MovieProviders = ({providers} : { providers: CountryResultInterface }) => {
    const providerObj: providerObjProps = { buy:'Buy', rent: 'Rent', flatrate: 'Flat rate', free: 'Free' };
   
    const providerMap: providerMapProps[] =  Object.keys(providers).filter(key => key !== 'link').map((i) => {
        return {
            key: i as providerKeys,
            label: providerObj[i as keyof providerObjProps]
        }
    })
    
    return (
        <Tabs.Root defaultValue={providerMap[0].key} variant="plain">
            <Tabs.List bg="bg.muted" rounded="l3" p="1">
                {
                    providerMap.map((provider: providerMapProps, index: number) => (
                        <Tabs.Trigger key={index} value={provider.key}>
                            { provider.label }
                        </Tabs.Trigger>
                    ))
                }
                <Tabs.Indicator rounded="l2" />
            </Tabs.List>
            {
                providerMap.map((provider: providerMapProps, index: number) => (
                    <Tabs.Content key={index} value={provider.key}>
                        <Box py={4} rounded="lg" overflow="hidden">
                            <SimpleGrid
                                columns={1}
                                gap={4}
                                >
                                {providers[provider.key as providerKeys]?.length && providers[provider.key as providerKeys]?.map((item, index) => (
                                    <Card.Root key={index} variant="elevated" colorPalette="orange">
                                        <Card.Body>
                                          <HStack gap="3">
                                            <Avatar.Root >
                                              <Avatar.Image src={`https://image.tmdb.org/t/p/w300/${item.logo_path}`} rounded="lg"/>
                                              <Avatar.Fallback name={item.provider_name} />
                                            </Avatar.Root>
                                            <Stack gap="0">
                                              <Text fontWeight="semibold" textStyle="sm">
                                                {item.provider_name}
                                              </Text>
                                            </Stack>
                                          </HStack>
                                        </Card.Body>
                                    </Card.Root>
                                ))}
                            </SimpleGrid>
                        </Box>
                    </Tabs.Content>
                ))
            }
        </Tabs.Root>
    );
};

export default MovieProviders;