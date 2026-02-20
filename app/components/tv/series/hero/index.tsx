import { Box } from "@chakra-ui/react";
import '~/styles.css'

import TVSeriesOverlay from "./movie-overlay";
import { TmdbTVSeriesDetailWAppendsProps } from "~/interfaces/tmdb/tv/series/details";
import TVSeriesPoster from "../previews/poster";
import { TmdbTVSeriesSummaryInterface } from "~/interfaces/tmdb/tv/series/summary";
import { usePosterGradientColor } from "~/hooks/use-poster-gradient-color";

const TVSeriesHero = ({series, height = '400px'} : {series: TmdbTVSeriesDetailWAppendsProps, height: string}) => {
    const gradientColor = usePosterGradientColor(
      series?.id,
      series?.poster_path,
      series?.id?.toString()
    );

    if (!series) return (<Box width="100%" height={height} backgroundColor="gray.900" rounded="md"></Box>)
    return (
      <Box position="relative" width="100%" backgroundColor="transparent" bgGradient="to-b" rounded="md" gradientFrom={gradientColor} gradientTo="transparent" pb={6}>
        {/* <MediaImage backdrop_path={series.backdrop_path}  /> */}
        <Box display="flex" justifyContent="space-between" alignItems="end" flexWrap="wrap" gap={4} p={4}>
          <Box minWidth="80px" maxWidth="160px">
            <TVSeriesPoster item={series as unknown as TmdbTVSeriesSummaryInterface}  includeTitle={false}/>
          </Box>
          <Box flex="1">
            <TVSeriesOverlay series={series} />
          </Box>
        </Box>
      </Box>
    );
};

export default TVSeriesHero;