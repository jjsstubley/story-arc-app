// app/components/movie-info-panel.tsx (Server Component)

import { Box, Heading, Separator, Accordion, Stack, Text} from "@chakra-ui/react";
import { FaPenFancy } from "react-icons/fa6";
import { IoBookmark } from "react-icons/io5";
import CollectionInfoPanelHeader from "./header";
import CollectionInfoPanelMetadata from "./metadata";
import WatchListCheckboxCards from "~/components/user-actions/watchlist/checkbox-cards";


import OverviewSection from "~/components/media/info-panel/sections/overview";
import Parts from "./sections/parts";

import { TmdbCollectionsInterface } from "~/interfaces/tmdb/tmdb-collections";
// No "use client" directive needed
export function CollectionInfoPanel({ collection, onClose }: { collection: TmdbCollectionsInterface, onClose: () => void }) {
    // ✅ Server-side data fetching
    console.log('CollectionInfoPanel collection', collection)
    const sections = [
        {
            title: 'Overview',
            value: 'overview',
            icon: <FaPenFancy color="whiteAlpha.600" />,
            description: `Overview of ${collection.name} (no spoilers)`,
            content: <OverviewSection overview={collection.overview} />
        },
        {
            title: 'Parts',
            value: 'parts',
            icon: <IoBookmark color="whiteAlpha.600" />,
            description: 'Build and organise your lists',
            content: <Parts parts={collection.parts || []} />
        },
        {
            title: 'Watchlists',
            value: 'watchlists',
            icon: <IoBookmark color="whiteAlpha.600" />,
            description: 'Build and organise your lists',
            content: <WatchListCheckboxCards movieId={collection.id} />
        }
    ]

    return (
      <Box>
        <CollectionInfoPanelHeader collection={collection} onClose={onClose} />
        <Box p={4} pt={0}>
            <CollectionInfoPanelMetadata collection={collection} />
            <Separator my={4} />
            <Accordion.Root collapsible defaultValue={["plot"]}>
                {
                    sections.map((section, index) => (
                        <Accordion.Item value={section.value} key={index}>
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
                                    {section.content}
                                </Accordion.ItemBody>
                            </Accordion.ItemContent>
                        </Accordion.Item>
                    ))
                }
            </Accordion.Root>
        </Box>
      </Box>
    )
  }