import { Box, Heading, Text } from "@chakra-ui/react";
import { getFormattedDate } from "~/utils/helpers";
import Genres from "~/components/media/common/genres";

import { TmdbTVSeriesDetailWAppendsProps } from "~/interfaces/tmdb/tv/series/details";
import { useMediaPanel } from "~/components/providers/media-provider";
import { useEffect } from "react";

const TVSeriesOverlay = ({series} : {series: TmdbTVSeriesDetailWAppendsProps}) => {
  const { openPanel } = useMediaPanel()

  useEffect(() => {
    openPanel({
      type: 'tv',
      data: series,
    })
  }, [series])

  return (
    <Box
      width="100%"
      // bgGradient="to-t" gradientFrom="blackAlpha.800" gradientTo="transparent" gradientVia="blackAlpha.800"
      color="white"

    >
      {/* Text and Data */}
      <Box display="flex" gap={4} alignItems="center">
        <Box display="flex" gap={2} alignItems="end">
            <Heading 
              as="h1"
              fontSize="lg"
              lineHeight={1.5}
              fontWeight="bold" 
              fontFamily="'Epilogue', sans-serif"
              letterSpacing="widest"
              textTransform="uppercase"
              color="white"
              textShadow="2px 2px 4px rgba(0,0,0,0.7)"
              borderLeft="4px solid"
              borderColor="orange.400"
              pl={3}
            >
                {series.name} <Text fontSize="xs" color="whiteAlpha.600" whiteSpace="nowrap">{ getFormattedDate({release_date: series.first_air_date, options: {year: 'numeric', month: 'long',day: 'numeric'}, region:'en-US'}) } | { series.number_of_seasons} seasons</Text> 
            </Heading>
        </Box>
        {/* <WatchListDropdown movieId={series.id}/> */}
        {/* This shows up only once user have mark as seen */}
        {/* <IconButton variant="subtle" border="1px solid" borderColor={"whiteAlpha.300"} rounded="full" onClick={() => setIsFavourite((prev) => !prev)}>
            {isFavourite ? (<Text color="red"><GoHeartFill size={28}/></Text>) : (<Text><GoHeart size={28}/></Text>) }
        </IconButton> */}
      </Box>

      {/* <Text mt={4}>{series.overview}</Text> */}
      {/* <Text mt={4}>Released { getFormattedDate({release_date: series.first_air_date, options: {year: 'numeric', month: 'long',day: 'numeric'}, region:'en-US'}) }</Text> */}
      <Box display="flex" gap={4} justifyContent="space-between" flexWrap="wrap">
        <Box display="flex" gap={2} mt={4}>
          <Genres genres={series.genres} />
        </Box>
      </Box>

    </Box>
  );
};

export default TVSeriesOverlay;