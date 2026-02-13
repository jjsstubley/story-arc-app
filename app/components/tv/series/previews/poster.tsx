import { Box, Text } from '@chakra-ui/react';

import BasePoster from '~/components/ui/base-poster';
import { TmdbTVSeriesSummaryInterface } from '~/interfaces/tmdb/tv/series/summary';
import MediaTriggerWrapper from '~/components/media/media-trigger-wrapper';

const TVSeriesPoster = ({item, includeTitle = true} : { item: TmdbTVSeriesSummaryInterface, includeTitle?: boolean }) => {
    const poster =  (
        <>
            <BasePoster file={item.poster_path} title={item.name} />
            {includeTitle && (
                <Box width="100%" color="white" pt={2} textAlign="left" lineClamp={1}>
                    <Text fontSize="xs" color="whiteAlpha.600">{item.name}</Text>
                </Box>
            )}
        </>
    )

    return (
        <MediaTriggerWrapper media={{ type: 'tv-series', data: item }} variant='link'>
            {poster}
        </MediaTriggerWrapper>
      );
};

export default TVSeriesPoster;
