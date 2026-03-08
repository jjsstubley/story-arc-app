import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { FaCircleCheck } from "react-icons/fa6";
import { TVSeasonDetailsInterface } from "~/interfaces/tmdb/tv/season/details";

interface FixedSeasonHeaderProps {
  season: TVSeasonDetailsInterface;
  seriesName?: string;
  seriesId?: number;
  gradientColor: string;
  watchedCount?: number;
  totalEpisodes?: number;
}

export default function FixedSeasonHeader({
  season,
  seriesName,
  seriesId,
  gradientColor,
  watchedCount = 0,
  totalEpisodes = 0,
}: FixedSeasonHeaderProps) {
  const allWatched =
    totalEpisodes > 0 && watchedCount >= totalEpisodes;
  return (
    <Box
      position="sticky"
      top={0}
      left={0}
      right={0}
      zIndex={100}
      borderBottom="1px solid"
      borderColor="whiteAlpha.200"
      backdropFilter="blur(10px)"
      transition="opacity 0.3s ease-in-out, transform 0.3s ease-in-out"
      overflow="hidden"
      opacity={1}
      transform="translateY(0)"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient="to-r"
        gradientFrom={gradientColor}
        gradientTo={gradientColor}
      />
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.3) 0%, transparent 10%, transparent 90%, rgba(0,0,0,0.3) 100%)",
        }}
      />
      <Box px={4} py={3} position="relative" zIndex={1}>
        <Flex flex={1} direction="column" gap={1} minW={0}>
          {seriesId != null && seriesName && (
            <Text
              as={Link}
              to={`/tv/series/${seriesId}`}
              fontSize="xs"
              color="whiteAlpha.700"
              textShadow="1px 1px 2px rgba(0,0,0,0.7)"
              _hover={{ color: "whiteAlpha.900" }}
            >
              Back to {seriesName}
            </Text>
          )}
          <Heading
            as="h2"
            size="lg"
            fontWeight={600}
            color="white"
            textShadow="2px 2px 4px rgba(0,0,0,0.7)"
            lineClamp={1}
          >
            {season.name}
          </Heading>
          {totalEpisodes > 0 && (
            <Flex alignItems="center" gap={2} color={allWatched ? "green.400" : "whiteAlpha.800"}>
              {allWatched ? (
                <>
                  <FaCircleCheck size={16} />
                  <Text fontSize="sm">Completed</Text>
                </>
              ) : (
                <Text fontSize="sm">
                  {watchedCount}/{totalEpisodes} episodes watched
                </Text>
              )}
            </Flex>
          )}
        </Flex>
      </Box>
    </Box>
  );
}
