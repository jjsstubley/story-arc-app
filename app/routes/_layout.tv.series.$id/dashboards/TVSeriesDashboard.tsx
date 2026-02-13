import { Box } from "@chakra-ui/react"

import { TVSeriesTable } from "~/components/tv/series/displays/series-table";
import { TVSeriesDetailsInterface } from "~/interfaces/tmdb/tv/series/details";
import TVSeriesHero from "~/components/tv/series/hero";


export default function TVSeriesDashboard({ series}: {series: TVSeriesDetailsInterface}) {
  return (
    <Box position="relative" flex={1} overflow="auto" height="calc(100vh - 100px)">
      <Box width="100%" top={10} zIndex={10}>
        <TVSeriesHero series={series} height="300px"/>
      </Box>
      <Box as="section" display="grid" gap={12} gridColumn={1} flex="1" overflow="hidden" pt={12} px={8} >
        <TVSeriesTable series={series} />
      </Box>
    </Box>
  );
}