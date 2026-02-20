// app/components/movie-info-panel.tsx (Server Component)

import { Box, Heading, Separator, Accordion, Stack, Text} from "@chakra-ui/react";
import { FaPenFancy } from "react-icons/fa6";
import { IoBookmark } from "react-icons/io5";

import InfoPanelHeader from "./header";
import InfoPanelMetadata from "./metadata";
import TVEpisodesCheckboxCards from "~/components/user-actions/watchlist/tv-episodes-checkbox-cards";



import { TVEpisodeDetailsInterface } from "~/interfaces/tmdb/tv/episode/details";
import OverviewSection from "~/components/media/info-panel/sections/overview";
// No "use client" directive needed
export function TVEpisodeInfoPanel({ episode, onClose, seriesId }: { episode: TVEpisodeDetailsInterface, onClose: () => void, seriesId?: number }) {
    // ✅ Server-side data fetching

    const sections = [
        {
            title: 'Plot',
            value: 'plot',
            icon: <FaPenFancy color="whiteAlpha.600" />,
            description: `Overview of ${episode.name} (no spoilers)`,
            content: <OverviewSection overview={episode.overview} />
        },


        {
            title: 'Watchlists',
            value: 'watchlists',
            icon: <IoBookmark color="whiteAlpha.600" />,
            description: 'Build and organise your lists',
            content: seriesId ? <TVEpisodesCheckboxCards seriesId={seriesId} seasonNumber={episode.season_number} episodeNumber={episode.episode_number} /> : null
        },  
    ]

    return (
      <Box>
        <InfoPanelHeader episode={episode} onClose={onClose} />
        <Box p={4} pt={0}>
            <InfoPanelMetadata episode={episode} />
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