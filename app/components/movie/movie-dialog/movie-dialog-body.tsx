import { Box, SimpleGrid, Image, Tabs, Text, Heading } from '@chakra-ui/react';
import { Link } from '@remix-run/react';
import { useState } from 'react';
import { PeopleListInterface } from '~/interfaces/people';
import { WatchProvidersInterface } from '~/interfaces/provider';
import { slugify } from '~/utils/helpers';

const MovieDialogBody = ({providers, credits} : { providers: WatchProvidersInterface | null, credits: PeopleListInterface | null }) => {
    const [region, setRegion] = useState('US')
    return (
        <Box display="flex" flexDirection="column" gap={8}>
            <Heading as="h3"> Cast </Heading>
            <Box display="flex" gap={1} flexWrap="wrap">
            {
                credits?.cast.map((credit, index) => (
                    <Link key={index} to={`/credit/${slugify(credit.name)}_${credit.cast_id}`}>
                        <Text _hover={{ color: 'orange.500'}} whiteSpace="nowrap">{credit.name}{index < credits.cast.length - 1 && ', '}</Text>
                    </Link>
                ))
            }
            </Box>
            <Tabs.Root defaultValue="Buy" variant="plain">
                <Tabs.List bg="bg.muted" rounded="l3" p="1">
                    {
                        providers?.results[region].buy?.length && (
                            <Tabs.Trigger value="Buy">
                                Buy
                            </Tabs.Trigger>
                        )
                    }
                    {
                        providers?.results[region].rent?.length && (
                            <Tabs.Trigger value="Rent">
                                Rent
                            </Tabs.Trigger>
                        )
                    }
                    <Tabs.Indicator rounded="l2" />
                </Tabs.List>
                <Tabs.Content value="Buy">
                    <Box py={4} rounded="lg" overflow="hidden">
                        <SimpleGrid
                            columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
                            gap={4}
                            mt={4}
                            >
                            {providers?.results[region].buy?.length && providers?.results[region]?.buy?.map((item, index) => (
                                <Box key={index} display="flex" gap={2} bg="whiteAlpha.50" color="white" p={2} rounded="lg" alignItems="center">
                                    <Image src={`https://image.tmdb.org/t/p/w300/${item.logo_path}`} objectFit="cover" width="40px" rounded="xl"/>
                                    <strong>{item.provider_name}</strong>
                                </Box>
                            ))}
                        </SimpleGrid>
                    </Box>
                </Tabs.Content>
                <Tabs.Content value="Rent">
                    <Box py={4} rounded="lg" overflow="hidden">
                        <SimpleGrid
                            columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
                            gap={4}
                            mt={4}
                            >
                            {providers?.results[region].rent?.length && providers?.results[region]?.rent?.map((item, index) => (
                                <Box key={index} display="flex" gap={2} bg="whiteAlpha.50" color="white" p={2} rounded="lg" alignItems="center">
                                    <Image src={`https://image.tmdb.org/t/p/w300/${item.logo_path}`} objectFit="cover" width="40px" rounded="xl"/>
                                    <strong>{item.provider_name}</strong>
                                </Box>
                            ))}
                        </SimpleGrid>
                    </Box>
                </Tabs.Content>
            </Tabs.Root>
        </Box>
    );
};

export default MovieDialogBody;