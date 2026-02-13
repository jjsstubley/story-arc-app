// app/components/movie-info-panel.tsx (Server Component)

import { Box, Heading, Separator, Accordion, Stack, Text} from "@chakra-ui/react";
import { FaPenFancy } from "react-icons/fa6";
import { IoBookmark } from "react-icons/io5";
import { FaTv } from "react-icons/fa";
import { GiFilmSpool } from "react-icons/gi";
import InfoPanelHeader from "./header";
import InfoPanelMetadata from "./metadata";
import WatchListCheckboxCards from "~/components/user-actions/watchlist/checkbox-cards";
import { MdOutlinePassword } from "react-icons/md";


import ProvidersSection from "~/components/media/info-panel/sections/providers";

import { TmdbTVSeriesDetailWAppendsProps } from "~/interfaces/tmdb/tv/series/details";
import OverviewSection from "~/components/media/info-panel/sections/overview";
import KeywordSection from "~/components/media/info-panel/sections/keywords";
import TrailersSection from "~/components/media/info-panel/sections/trailers";
import Seasons from "./sections/seasons";
// No "use client" directive needed
export function TVSeriesInfoPanel({ series, onClose }: { series: TmdbTVSeriesDetailWAppendsProps, onClose: () => void }) {
    // ✅ Server-side data fetching

    const sections = [
        {
            title: 'Plot',
            value: 'plot',
            icon: <FaPenFancy color="whiteAlpha.600" />,
            description: `Overview of ${series.name} (no spoilers)`,
            content: <OverviewSection overview={series.overview} />
        },
        {
            title: 'Seasons',
            value: 'seasons',
            icon: <FaTv color="whiteAlpha.600" />,
            description: 'Take a look into the seasons of the show',
            content: <Seasons seasons={series.seasons || []} seriesId={series.id} />
        },
        {
            title: 'Keywords',
            value: 'keywords',
            icon: <MdOutlinePassword color="whiteAlpha.600" />,
            description: 'Take a look into some themes and explore',
            content: <KeywordSection keywords={series.keywords?.keywords || []} />
        },
        {
            title: 'Watchlists',
            value: 'watchlists',
            icon: <IoBookmark color="whiteAlpha.600" />,
            description: 'Build and organise your lists',
            content: <WatchListCheckboxCards movieId={series.id} />
        },  
        {
            title: 'Providers',
            value: 'providers',
            icon: <FaTv color="whiteAlpha.600" />,
            description: 'Where can you watch this movie?',
            content: series.providers && <ProvidersSection providers={series.providers} />
        },
        {
            title: 'Trailer',
            value: 'trailer',
            icon: <GiFilmSpool color="whiteAlpha.600" />,
            description: `Get a brief look into ${series.name}`,
            content: <TrailersSection videos={series.videos?.results || []} />
        },
    ]

    return (
      <Box>
        <InfoPanelHeader series={series} onClose={onClose} />
        <Box p={4} pt={0}>
            <InfoPanelMetadata series={series} />
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