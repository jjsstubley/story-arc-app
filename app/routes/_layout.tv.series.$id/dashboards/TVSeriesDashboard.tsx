import { Box } from "@chakra-ui/react";

import { TVSeriesTable } from "~/components/tv/series/displays/series-table";
import FixedSeriesHeader from "~/components/tv/series/fixed-series-header";
import TVSeriesHero from "~/components/tv/series/hero";
import { TVSeriesDetailsInterface } from "~/interfaces/tmdb/tv/series/details";
import { usePosterGradientColor } from "~/hooks/use-poster-gradient-color";

export default function TVSeriesDashboard({
  series,
  watchedBySeason = {},
  seasonCompleted = {},
  seasonsCompletedCount = 0,
  totalSeasons = 0,
}: {
  series: TVSeriesDetailsInterface;
  watchedBySeason?: Record<number, number[]>;
  seasonCompleted?: Record<number, boolean>;
  seasonsCompletedCount?: number;
  totalSeasons?: number;
}) {
  const gradientColor = usePosterGradientColor(
    series?.id,
    series?.poster_path,
    series?.id?.toString()
  );

  if (!series) {
    return null;
  }

  return (
    <Box position="relative" flex={1} overflow="auto" height="calc(100vh - 100px)">
      <FixedSeriesHeader
        series={series}
        gradientColor={gradientColor}
        seasonsCompletedCount={seasonsCompletedCount}
        totalSeasons={totalSeasons}
      />
      <Box width="100%" top={10} zIndex={10}>
        <TVSeriesHero series={series} height="300px" />
      </Box>
      <Box
        as="section"
        display="grid"
        gap={12}
        gridColumn={1}
        flex="1"
        overflow="hidden"
        pt={12}
        px={8}
      >
        <TVSeriesTable
          series={series}
          watchedBySeason={watchedBySeason}
          seasonCompleted={seasonCompleted}
        />
      </Box>
    </Box>
  );
}