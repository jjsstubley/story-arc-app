import { Box, Heading, Stat, Text } from "@chakra-ui/react";
import '~/styles.css'
import { formatReadableNumber, getFormattedDate } from "~/utils/helpers";

import { TmdbMovieSummaryInterface } from "~/interfaces/tmdb/movie/summary";
import PopularityIndex from "../common/popularity-index";
import MediaTriggerWrapper from "~/components/media/media-trigger-wrapper";
import MediaImage from "~/components/media/common/movie-image";

const FeatureMovie = ({movie, height = '400px', displayPopularity = false, variant='info-panel'} : {movie: TmdbMovieSummaryInterface, height?: string, displayPopularity?: boolean, variant?: 'dialog' | 'info-panel' }) => {

  if (!movie) return (<Box width="100%" height={height} backgroundColor="gray.900" rounded="md"></Box>)

  const feature = (
    <Box position="relative">
      <MediaImage backdrop_path={movie.backdrop_path} height={height} />
      <Box
        position="absolute"
        bottom="0"
        left="0"
        width="100%"
        bgGradient="to-t" gradientFrom="blackAlpha.800" gradientTo="transparent" gradientVia="blackAlpha.800"
        color="white"
        p={4}
        px={8}
      >
        {/* Text and Data */}
        
        <Box display="flex" gap={4} alignItems="end">
          <Heading as="h1" lineHeight={1} letterSpacing="0.225rem" size="4xl" fontFamily="'Epilogue', sans-serif" fontWeight={400}>{movie.title}</Heading>
        </Box>

        <Text mt={4}>Released { getFormattedDate({release_date: movie.release_date, options: {year: 'numeric', month: 'long',day: 'numeric'}, region:'en-US'}) }</Text>
        <Box display="flex" gap={4} justifyContent="space-between">
          <Box width="300px" display="flex" flexDirection="column" gap={2} justifyContent="end">
            {
              !displayPopularity ? (
                <Box display="flex" gap={2} alignItems="center" justifyContent="end">
                  <Box position="relative" width="100%">
                      <Box position="absolute"  top="0" left="0" zIndex={1} bg="orange.400" height="8px" rounded="md" width={`${(parseFloat(movie.vote_average.toString()) / 10) * 100}%`}></Box>
                      <Box bg="gray.200" height="8px" rounded="md" width="100%"></Box>
                  </Box>
                  <Box width="200px" display="flex" gap={2} alignItems="center">
                    <Text whiteSpace="nowrap">{parseFloat(movie.vote_average.toString()).toFixed(1)} / 10</Text>
                    <Text whiteSpace="nowrap" fontSize="xs">{formatReadableNumber(parseInt(movie.vote_count.toString()))} votes</Text>
                  </Box>
                </Box>
              ) : (
                <Stat.Root>
                  <Stat.Label>Popularity Index</Stat.Label>
                  <Stat.ValueText><PopularityIndex score={movie.popularity} /></Stat.ValueText>
                </Stat.Root>
              )
            }
          </Box>
        </Box>

      </Box>
    </Box>        
  )

  return (
    <MediaTriggerWrapper media={{ type: 'movie', data: movie }} variant={movie.media_type === 'tv' ? 'link' : variant}>
        {feature}
    </MediaTriggerWrapper>
  );
};

export default FeatureMovie;