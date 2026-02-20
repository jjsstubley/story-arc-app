import { Box, Text, HStack } from '@chakra-ui/react';
import { TmdbTVSeriesSummaryInterface } from '~/interfaces/tmdb/tv/series/summary';
import BasePoster from '~/components/ui/base-poster';
import MediaTriggerWrapper from '~/components/media/media-trigger-wrapper';

const TVSeriesPosterList = ({ item }: { item: TmdbTVSeriesSummaryInterface | { id: number } }) => {
  const seriesData = item as TmdbTVSeriesSummaryInterface;
  const hasPoster = 'poster_path' in seriesData && seriesData.poster_path;
  const hasName = 'name' in seriesData && seriesData.name;

  const poster = (
    <>
      <Box display="flex" gap={2} alignItems="center">
        <Box width={10}>
          {hasPoster ? (
            <BasePoster file={seriesData.poster_path} title={seriesData.name} />
          ) : (
            <Box width={10} height={15} bg="gray.700" rounded="sm" />
          )}
        </Box>
        <HStack width="100%" justifyContent="space-between" alignItems="center">
          <Box flex={1} color="white" textAlign="left">
            <Text fontSize="xs" color="whiteAlpha.600">
              {hasName ? seriesData.name : `Series ${seriesData.id}`}
            </Text>
          </Box>
        </HStack>
      </Box>
    </>
  );

  return (
    <MediaTriggerWrapper media={{ type: 'tv-series', data: seriesData }} variant="link">
      {poster}
    </MediaTriggerWrapper>
  );
};

export default TVSeriesPosterList;

