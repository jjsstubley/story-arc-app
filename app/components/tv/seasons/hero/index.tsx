import { Box, Heading, Image, Text } from "@chakra-ui/react";
import "~/styles.css";
import { FaCircleCheck } from "react-icons/fa6";

import BasePoster from "~/components/ui/base-poster";
import { TVSeasonDetailsInterface } from "~/interfaces/tmdb/tv/season/details";
import { usePosterGradientColor } from "~/hooks/use-poster-gradient-color";
import { getFormattedDate } from "~/utils/helpers";

const SeasonHero = ({
  season,
  height = "300px",
  watchedCount = 0,
  totalEpisodes = 0,
}: {
  season: TVSeasonDetailsInterface;
  height?: string;
  watchedCount?: number;
  totalEpisodes?: number;
}) => {
  const gradientColor = usePosterGradientColor(
    season?.id,
    season?.poster_path,
    season?.id?.toString()
  );

  if (!season)
    return (
      <Box
        width="100%"
        height={height}
        backgroundColor="gray.900"
        rounded="md"
      />
    );

  const episodeCount = season.episodes?.length ?? 0;
  const allWatched =
    totalEpisodes > 0 && watchedCount >= totalEpisodes;

  return (
    <Box position="relative" width="100%" rounded="md" overflow="hidden">
      {season.poster_path && (
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
            src={`https://image.tmdb.org/t/p/original/${season.poster_path}`}
            width="100%"
            height="100%"
            objectFit="cover"
            objectPosition="center"
            filter="blur(10px) brightness(0.8)"
            transform="scale(1.1)"
          />
        </Box>
      )}

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
            <BasePoster file={season.poster_path} title={season.name} />
          </Box>
          <Box flex="1" color="white">
            <Heading
              as="h1"
              size="lg"
              fontWeight={600}
              color="white"
              textShadow="2px 2px 4px rgba(0,0,0,0.7)"
            >
              {season.name}
            </Heading>
            <Box display="flex" gap={2} mt={2} flexWrap="wrap" alignItems="center">
              {season.air_date && (
                <Text fontSize="sm" color="whiteAlpha.800">
                  {getFormattedDate({
                    release_date: season.air_date,
                    options: {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                    region: "en-US",
                  })}
                </Text>
              )}
              {episodeCount > 0 && (
                <Text fontSize="sm" color="whiteAlpha.800">
                  {episodeCount} episode{episodeCount === 1 ? "" : "s"}
                </Text>
              )}
              {totalEpisodes > 0 && (
                <Box
                  display="flex"
                  alignItems="center"
                  gap={2}
                  color={allWatched ? "green.400" : "whiteAlpha.800"}
                >
                  {allWatched ? (
                    <>
                      <FaCircleCheck size={18} />
                      <Text fontSize="sm">Completed</Text>
                    </>
                  ) : (
                    <Text fontSize="sm">
                      {watchedCount}/{totalEpisodes} episodes watched
                    </Text>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SeasonHero;
