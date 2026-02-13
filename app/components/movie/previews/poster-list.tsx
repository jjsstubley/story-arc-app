import { Box, Text } from '@chakra-ui/react';
import { TmdbMovieSummaryInterface } from '~/interfaces/tmdb/movie/summary';
import BasePoster from '~/components/ui/base-poster';
import MediaTriggerWrapper from '~/components/media/media-trigger-wrapper';

const MoviePosterList = ({item, variant = 'info-panel'} : { item: TmdbMovieSummaryInterface, variant?: 'dialog' | 'info-panel' }) => {

    const poster = (
        <>
            <Box display="flex" gap={2} alignItems="center">
                <Box width={10}><BasePoster file={item.poster_path} title={item.title} /></Box>
                <Box width="100%" color="white" textAlign="left">
                    <Text fontSize="xs" color="whiteAlpha.600">{item.title}</Text>
                </Box>

            </Box>
        </>
    );

    return (
        <MediaTriggerWrapper media={{ type: 'movie', data: item }} variant={item.media_type === 'tv' ? 'link' : variant}>
            {poster}
        </MediaTriggerWrapper>
    );
};

export default MoviePosterList;