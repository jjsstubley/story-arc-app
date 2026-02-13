import { Box } from "@chakra-ui/react";
import WatchListCheckboxCards from "~/components/user-actions/watchlist/checkbox-cards";
import { TmdbTVSeriesDetailWAppendsProps } from "~/interfaces/tmdb/tv/series/details";

const OverviewSection = ({series} : { series: TmdbTVSeriesDetailWAppendsProps    }) => {

    return (
      <Box listStyle="none" padding={0} margin={0} spaceY={4} pl={4} borderLeft="1px solid" borderColor="gray.700">
        <WatchListCheckboxCards movieId={series.id} />
      </Box>
    );
};

export default OverviewSection;