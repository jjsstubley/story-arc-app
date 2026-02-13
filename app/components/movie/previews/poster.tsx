import { Box, Text } from '@chakra-ui/react';
import { TmdbMovieSummaryInterface } from '~/interfaces/tmdb/movie/summary';

import BasePoster from '~/components/ui/base-poster';

import MediaTriggerWrapper from '~/components/media/media-trigger-wrapper';

const MoviePoster = ({item, variant='info-panel', includeTitle = true} : { item: TmdbMovieSummaryInterface, variant?: 'dialog' | 'info-panel', includeTitle?: boolean }) => {
    const poster =  (
        <>
            <BasePoster file={item.poster_path} title={item.title} />
            {includeTitle && (
                <Box width="100%" color="white" pt={2} textAlign="left" lineClamp={1}>
                    <Text fontSize="xs" color="whiteAlpha.600">{item.title}</Text>
                </Box>
            )}
        </>
    )
    return (
        <MediaTriggerWrapper media={{ type: 'movie', data: item }} variant={item.media_type === 'tv' ? 'link' : variant}>
            {poster}
        </MediaTriggerWrapper>
    );
};

export default MoviePoster;
