import { Box, Text } from '@chakra-ui/react';
import { TVSeasonSummaryInterface } from '~/interfaces/tmdb/tv/season/summary';
import BasePoster from '~/components/ui/base-poster';
import MediaTriggerWrapper from '~/components/media/media-trigger-wrapper';

const TVSeasonPosterList = ({item, variant = 'info-panel', seriesId} : { item: TVSeasonSummaryInterface, variant?: 'dialog' | 'info-panel', seriesId: number }) => {

    const poster = (
        <>
            <Box display="flex" gap={2} alignItems="center">
                <Box width={10}><BasePoster file={item.poster_path} title={item.name} /></Box>
                <Box width="100%" color="white" textAlign="left">
                    <Text fontSize="xs" color="whiteAlpha.600">{item.name}</Text>
                </Box>

            </Box>
        </>
    );

    return (
        <MediaTriggerWrapper media={{ type: 'tv-season', data: item, seriesId: seriesId }} variant={variant}>
            {poster}
        </MediaTriggerWrapper>
    );
};

export default TVSeasonPosterList;