import { Box, Text } from '@chakra-ui/react';

import BasePoster from '~/components/ui/base-poster';
import MediaTriggerWrapper from '~/components/media/media-trigger-wrapper';
import { TVEpisodeSummaryInterface } from '~/interfaces/tmdb/tv/episode/summary';

const TVEpisodePoster = ({item, includeTitle = true, seriesId} : { item: TVEpisodeSummaryInterface , includeTitle?: boolean, seriesId: number }) => {
    const poster =  (
        <>
            <BasePoster file={item.still_path} title={item.name} />
            {includeTitle && (
                <Box width="100%" color="white" pt={2} textAlign="left" lineClamp={1}>
                    <Text fontSize="xs" color="whiteAlpha.600">{item.name}</Text>
                </Box>
            )}
        </>
    )

    return (
        <MediaTriggerWrapper media={{ type: 'tv-episode', data: item, seriesId: seriesId }}>
            {poster}
        </MediaTriggerWrapper>
      );
};

export default TVEpisodePoster;
