import { Box } from "@chakra-ui/react";
import { WatchlistPicker } from "~/features/watchlists";
import { TVSeasonDetailsInterface } from "~/interfaces/tmdb/tv/season/details";

const OverviewSection = ({season} : { season: TVSeasonDetailsInterface }) => {

    return (
      <Box listStyle="none" padding={0} margin={0} spaceY={4} pl={4} borderLeft="1px solid" borderColor="gray.700">
        <WatchlistPicker movieId={season.id} />
      </Box>
    );
};

export default OverviewSection;