import {  Box, Heading, Stack, Text, ButtonGroup, Button, Separator, VStack } from "@chakra-ui/react"
import { Link } from "@remix-run/react";

import { RiFireFill } from "react-icons/ri";
import { LuPopcorn } from "react-icons/lu";

import DefaultWatchlist from "../../watchlist/default-watchlist";
import { useState } from "react";
import CollectionsList from "~/components/collections/displays/collections-list";
import SavedSeriesList from "~/components/tv-series/saved-series-list";
import { WatchlistInterface } from "~/interfaces/watchlist";

export default function LibraryNavSection({ watchlists = [] }: { watchlists?: WatchlistInterface[] }) {

    const [filter, setFilter] = useState('all');
    const popcornWatchlist = watchlists.find((watchlist) => watchlist.id === "popcorn") || null;

    // const sections = [
    //     {
    //         title: "Watchlist",
    //         value: "watchlist",
    //         description: "Movies you've save to watch for another time",
    //         icon: <RiFireFill color="whiteAlpha.600" />,
    //         content: <DefaultWatchlist filter={filter} />
    //     }
    // ]       
  return (
    <Box>
        {/* <SearchFeature genres={genres} /> */}
        <ButtonGroup variant="outline" wrap="wrap">
            <Button p={2} size="sm" rounded="full" variant={filter === 'all' ? 'solid' : 'outline'} onClick={() => setFilter('all')}>
                All
            </Button>
            <Button p={2} size="sm" rounded="full" variant={filter === 'movie' ? 'solid' : 'outline'} onClick={() => setFilter('movie')}>
                Movies
            </Button>
            <Button p={2} size="sm" rounded="full" variant={filter === 'tv' ? 'solid' : 'outline'} onClick={() => setFilter('tv')}>
                TV Series
            </Button>
            <Button p={2} size="sm" rounded="full" variant={filter === 'collections' ? 'solid' : 'outline'} onClick={() => setFilter('collections')}>
                Collections
            </Button>
        </ButtonGroup>
        <Separator orientation="horizontal" borderColor="whiteAlpha.500" width="100%" my={4} />
        {filter === 'collections' ? (
          <>
            <Stack gap="1" mb={4}>
              <Box display="flex" gap={4} alignItems="center">
                <RiFireFill color="whiteAlpha.600" />
                <Heading as="h3" color="whiteAlpha.600" size="sm"> Your Collections </Heading>
              </Box>
              <Text fontSize="xs" color="fg.muted">Collections you&apos;ve created or forked</Text>
            </Stack>
            <VStack gap={2} align="stretch">
              <CollectionsList />
              <Link to="/watchlists/popcorn">
                <Box
                  p={3}
                  rounded="md"
                  border="1px solid"
                  borderColor="gray.700"
                  _hover={{ bg: "gray.800", borderColor: "orange.500" }}
                  transition="all 0.2s"
                >
                  <Stack gap={1}>
                    <Box display="flex" gap={2} alignItems="center">
                      <LuPopcorn color="whiteAlpha.600" size={16} />
                      <Heading as="h4" size="sm" fontWeight="semibold">
                        Popcorn watchlist
                      </Heading>
                    </Box>
                    <Text fontSize="xs" color="fg.muted" noOfLines={1}>
                      A quick list of movies you&apos;re in the mood to watch — perfect for tonight&apos;s lineup.
                    </Text>
                    <Text fontSize="xs" color="fg.muted">
                      {popcornWatchlist?.watchlist_items?.length || 0} movies
                    </Text>
                  </Stack>
                </Box>
              </Link>
            </VStack>
          </>
        ) : filter === 'tv' ? (
          <>
            <Stack gap="1" mb={4}>
              <Box display="flex" gap={4} alignItems="center">
                <RiFireFill color="whiteAlpha.600" />
                <Heading as="h3" color="whiteAlpha.600" size="sm"> TV Series </Heading>
              </Box>
              <Text fontSize="xs" color="fg.muted">TV series you&apos;ve saved</Text>
            </Stack>
            <SavedSeriesList />
          </>
        ) : (
          <>
            <Stack gap="1">
              <Box display="flex" gap={4} alignItems="center">
                <RiFireFill color="whiteAlpha.600" />
                <Heading as="h3" color="whiteAlpha.600" size="sm"> All Saved items </Heading>
              </Box>
              <Text fontSize="xs" color="fg.muted">Movies you&apos;ve save to watch for another time</Text>
            </Stack>
            <DefaultWatchlist filter={filter} />
          </>
        )}
        {/* <Accordion.Root collapsible defaultValue={["watchlist"]}>
            {sections.map((section) => (
                <Accordion.Item key={section.value} value={section.value}>
                    <Accordion.ItemTrigger>
                        <Stack gap="1">
                            <Box display="flex" gap={4} alignItems="center">
                                {section.icon}
                                <Heading as="h3" color="whiteAlpha.600" size="sm"> {section.title} </Heading>
                            </Box>
                            <Text fontSize="xs" color="fg.muted">{section.description}</Text>
                        </Stack>
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent>
                        <Accordion.ItemBody>
                            <Box listStyle="none" padding={0} margin={0} spaceY={4} pl={4} borderLeft="1px solid" borderColor="gray.700">
                                {section.content}
                            </Box>
                        </Accordion.ItemBody>
                    </Accordion.ItemContent>
                </Accordion.Item>
            ))}
        </Accordion.Root> */}
  </Box>
  );
}