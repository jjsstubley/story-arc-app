import { Box, Image } from "@chakra-ui/react";
import "~/styles.css";

import TVSeriesOverlay from "./movie-overlay";
import { TmdbTVSeriesDetailWAppendsProps } from "~/interfaces/tmdb/tv/series/details";
import TVSeriesPoster from "../previews/poster";
import { TmdbTVSeriesSummaryInterface } from "~/interfaces/tmdb/tv/series/summary";
import { usePosterGradientColor } from "~/hooks/use-poster-gradient-color";

const TVSeriesHero = ({
  series,
  height = "400px",
}: {
  series: TmdbTVSeriesDetailWAppendsProps;
  height: string;
}) => {
  const gradientColor = usePosterGradientColor(
    series?.id,
    series?.poster_path,
    series?.id?.toString()
  );

  if (!series)
    return (
      <Box
        width="100%"
        height={height}
        backgroundColor="gray.900"
        rounded="md"
      />
    );

  return (
    <Box position="relative" width="100%" rounded="md" overflow="hidden">
      {/* Background image layer - subtle, centered */}
      {series.backdrop_path && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={0}
          opacity={0.25}
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
        >
          <Image
            src={`https://image.tmdb.org/t/p/original/${series.backdrop_path}`}
            width="100%"
            height="100%"
            objectFit="cover"
            objectPosition="center"
            filter="blur(10px) brightness(0.8)"
            transform="scale(1.1)"
          />
        </Box>
      )}

      {/* Gradient overlay */}
      <Box
        position="relative"
        zIndex={1}
        backgroundColor="transparent"
        bgGradient="to-b"
        gradientFrom={gradientColor}
        gradientTo="transparent"
        pb={6}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="end"
          flexWrap="wrap"
          gap={4}
          p={4}
        >
          <Box minWidth="80px" maxWidth="160px">
            <TVSeriesPoster
              item={series as unknown as TmdbTVSeriesSummaryInterface}
              includeTitle={false}
            />
          </Box>
          <Box flex="1">
            <TVSeriesOverlay series={series} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TVSeriesHero;