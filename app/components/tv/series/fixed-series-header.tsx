import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { checkTVSeries, toggleTVSeries } from "~/components/user-actions/watchlist/services";
import { useWatchlistContext } from "~/components/providers/watchlist-context";
import { TVSeriesDetailsInterface } from "~/interfaces/tmdb/tv/series/details";

interface FixedSeriesHeaderProps {
  series: Pick<TVSeriesDetailsInterface, "id" | "name">;
  gradientColor: string;
  seasonsCompletedCount?: number;
  totalSeasons?: number;
}

export default function FixedSeriesHeader({
  series,
  gradientColor,
  seasonsCompletedCount = 0,
  totalSeasons = 0,
}: FixedSeriesHeaderProps) {
  const allComplete =
    totalSeasons > 0 && seasonsCompletedCount >= totalSeasons;
  const [saved, setSaved] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const { updateWatchlist } = useWatchlistContext();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await checkTVSeries(series.id);
        if (!cancelled) setSaved(Boolean(data?.exists));
      } catch {
        if (!cancelled) setSaved(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [series.id]);

  async function handleToggle() {
    setToggling(true);
    try {
      const ok = await toggleTVSeries(series.id, saved);
      if (ok) {
        setSaved(!saved);
        updateWatchlist("saved-tv-series");
      }
    } finally {
      setToggling(false);
    }
  }

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
      {/* Gradient background */}
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
      {/* Opacity gradient overlay for fade effect at edges */}
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
        <Flex alignItems="center" justifyContent="space-between" gap={4} flexWrap="wrap">
          <Flex direction="column" gap={1} flex={1} minW={0}>
            <Heading
              as="h2"
              size="lg"
              fontWeight={600}
              color="white"
              textShadow="2px 2px 4px rgba(0,0,0,0.7)"
              lineClamp={1}
            >
              {series.name}
            </Heading>
            {totalSeasons > 0 && (
              <Flex
                alignItems="center"
                gap={2}
                color={allComplete ? "green.400" : "whiteAlpha.800"}
              >
                {allComplete ? (
                  <>
                    <FaCircleCheck size={16} />
                    <Text fontSize="sm">Complete</Text>
                  </>
                ) : (
                  <Text fontSize="sm">
                    {seasonsCompletedCount}/{totalSeasons} seasons completed
                  </Text>
                )}
              </Flex>
            )}
          </Flex>
          <Button
            size="sm"
            variant="solid"
            colorPalette={saved ? "green" : undefined}
            onClick={handleToggle}
            disabled={loading || toggling}
            aria-label={saved ? "Remove from saved series" : "Add series"}
            gap={2}
          >
            {saved ? (
              <>
                <FaCircleCheck size={18} />
                Saved
              </>
            ) : (
              "Add Series"
            )}
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
