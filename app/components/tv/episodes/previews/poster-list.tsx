import { Box, Text } from '@chakra-ui/react';
import { TVEpisodeSummaryInterface } from '~/interfaces/tmdb/tv/episode/summary';
import BasePoster from '~/components/ui/base-poster';
import MediaTriggerWrapper from '~/components/media/media-trigger-wrapper';

const TVEpisodePosterList = ({item, variant = 'info-panel', seriesId} : { item: TVEpisodeSummaryInterface, variant?: 'dialog' | 'info-panel', seriesId: number }) => {

    const poster = (
        <>
            <Box display="flex" gap={2} alignItems="center">
                <Box width={10}><BasePoster file={item.still_path} title={item.name} /></Box>
                <Box width="100%" color="white" textAlign="left">
                    <Text fontSize="xs" color="whiteAlpha.600">{item.name}</Text>
                </Box>

            </Box>
        </>
    );

    return (
        <MediaTriggerWrapper media={{ type: 'tv-episode', data: item, seriesId: seriesId }} variant={variant}>
            {poster}
        </MediaTriggerWrapper>
    );
};

export default TVEpisodePosterList;