import { Box, Image, SimpleGrid, Tabs } from '@chakra-ui/react';
import { CountryResultInterface } from '~/interfaces/provider';

type providerKeys = 'buy' | 'rent' | 'flatrate'

type providerObjProps = {
    [K in providerKeys]: string;
}

interface providerMapProps {
    key: providerKeys,
    label: string,
}


const MovieProviders = ({providers} : { providers: CountryResultInterface }) => {
    const providerObj: providerObjProps = { buy:'Buy', rent: 'Rent', flatrate: 'Flat rate' };
   
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
                                columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
                                gap={4}
                                mt={4}
                                >
                                {providers[provider.key as providerKeys]?.length && providers[provider.key as providerKeys]?.map((item, index) => (
                                    <Box key={index} display="flex" gap={2} bg="whiteAlpha.50" color="white" p={2} rounded="lg" alignItems="center">
                                        <Image src={`https://image.tmdb.org/t/p/w300/${item.logo_path}`} objectFit="cover" width="40px" rounded="xl"/>
                                        <strong>{item.provider_name}</strong>
                                    </Box>
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