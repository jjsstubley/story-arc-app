// app/components/movie-info-panel.tsx (Server Component)

import { Box, Heading, Separator, Accordion, Stack, Text} from "@chakra-ui/react";
import { FaPenFancy } from "react-icons/fa6";
import { IoBookmark } from "react-icons/io5";
import { FaTv, FaUser, FaStar, FaComment } from "react-icons/fa";
import { GiFilmSpool } from "react-icons/gi";
import InfoPanelHeader from "./header";
import InfoPanelMetadata from "./metadata";
import { WatchlistPicker } from "~/features/watchlists";
import { MdOutlinePassword } from "react-icons/md";
import { RatingSection } from "~/features/ratings";
import ReviewsSection from "~/components/user-actions/reviews/reviews-section";


import ProvidersSection from "~/components/media/info-panel/sections/providers";

import { TmdbMovieDetailWAppendsProps } from "~/interfaces/tmdb/movie/detail";
import OverviewSection from "~/components/media/info-panel/sections/overview";
import KeywordSection from "~/components/media/info-panel/sections/keywords";
import TrailersSection, { getPlayableTrailers } from "~/components/media/info-panel/sections/trailers";
import CreditsSection from "~/components/media/info-panel/sections/credits";
// No "use client" directive needed
export function MovieInfoPanel({ movie, onClose }: { movie: TmdbMovieDetailWAppendsProps, onClose: () => void }) {
    // ✅ Server-side data fetching

    const sections: { title: string; value: string; icon: JSX.Element; description: string; content: JSX.Element; isEmpty?: boolean }[] = [
        {
            title: 'Plot',
            value: 'plot',
            icon: <FaPenFancy color="whiteAlpha.600" />,
            description: `Overview of ${movie.title} (no spoilers)`,
            content: <OverviewSection overview={movie.overview} />,
            isEmpty: !movie.overview?.trim()
        },
        {
            title: 'Credits',
            value: 'credits',
            icon: <FaUser color="whiteAlpha.600" />,
            description: 'Take a look into the credits of the movie',
            content: <CreditsSection cast={movie.credits?.cast || []} />,
            isEmpty: !movie.credits?.cast?.length
        },
        {
            title: 'Keywords',
            value: 'keywords',
            icon: <MdOutlinePassword color="whiteAlpha.600" />,
            description: 'Take a look into some themes and explore',
            content: <KeywordSection keywords={movie.keywords?.keywords || []} />,
            isEmpty: !movie.keywords?.keywords?.length
        },
        {
            title: 'Watchlists',
            value: 'watchlists',
            icon: <IoBookmark color="whiteAlpha.600" />,
            description: 'Build and organise your lists',
            content: <WatchlistPicker movieId={movie.id} />
        },
        {
            title: 'Rating',
            value: 'rating',
            icon: <FaStar color="whiteAlpha.600" />,
            description: 'Rate this movie',
            content: <RatingSection movieId={movie.id} />
        },
        {
            title: 'Reviews',
            value: 'reviews',
            icon: <FaComment color="whiteAlpha.600" />,
            description: 'Read and write reviews',
            content: <ReviewsSection movieId={movie.id} />
        },
        {
            title: 'Providers',
            value: 'providers',
            icon: <FaTv color="whiteAlpha.600" />,
            description: 'Where can you watch this movie?',
            content: <ProvidersSection providers={movie.providers} />
        },
        {
            title: 'Trailer',
            value: 'trailer',
            icon: <GiFilmSpool color="whiteAlpha.600" />,
            description: `Get a brief look into ${movie.title}`,
            content: <TrailersSection videos={movie.videos?.results || []} />,
            isEmpty: !getPlayableTrailers(movie.videos?.results || []).length
        },
    ]
    // Hide TMDB reference sections that have nothing to show; action sections always render.
    const visibleSections = sections.filter((section) => !section.isEmpty);

    return (
      <Box>
        <InfoPanelHeader movie={movie} onClose={onClose} />
        <Box p={4} pt={0}>
            <InfoPanelMetadata movie={movie} />
            <Separator my={4} />
            <Accordion.Root collapsible defaultValue={visibleSections[0] ? [visibleSections[0].value] : []}>
                {
                    visibleSections.map((section) => (
                        <Accordion.Item value={section.value} key={section.value}>
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