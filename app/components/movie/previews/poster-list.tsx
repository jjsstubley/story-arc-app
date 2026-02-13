import { Box, Text, HStack } from '@chakra-ui/react';
import { TmdbMovieSummaryInterface } from '~/interfaces/tmdb/movie/summary';
import BasePoster from '~/components/ui/base-poster';
import MediaTriggerWrapper from '~/components/media/media-trigger-wrapper';
import WatchListDropdown from '~/components/user-actions/watchlist/dropdown';

const MoviePosterList = ({item, variant = 'info-panel', inDialog = false} : { item: TmdbMovieSummaryInterface, variant?: 'dialog' | 'info-panel' | 'sheet', inDialog?: boolean }) => {

    const poster = (
        <>
            <Box display="flex" gap={2} alignItems="center">
                <Box width={10}><BasePoster file={item.poster_path} title={item.title} /></Box>
                <HStack width="100%" justifyContent="space-between" alignItems="center">
                    <Box flex={1} color="white" textAlign="left">
                        <Text fontSize="xs" color="whiteAlpha.600">{item.title}</Text>
                    </Box>
                    <Box onClick={(e) => e.stopPropagation()}>
                        <WatchListDropdown movieId={item.id} />
                    </Box>
                </HStack>
            </Box>
        </>
    );

    const effectiveVariant = inDialog ? 'sheet' : variant;

    return (
        <MediaTriggerWrapper media={{ type: 'movie', data: item }} variant={item.media_type === 'tv' ? 'link' : effectiveVariant}>
            {poster}
        </MediaTriggerWrapper>
    );
};

export default MoviePosterList;