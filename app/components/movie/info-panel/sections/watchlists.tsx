import { Box } from "@chakra-ui/react";
import WatchListCheckboxCards from "~/components/user-actions/watchlist/checkbox-cards";
import { TmdbMovieDetailWAppendsProps } from "~/interfaces/tmdb/movie/detail";

const OverviewSection = ({movie} : { movie: TmdbMovieDetailWAppendsProps }) => {

    return (
      <Box listStyle="none" padding={0} margin={0} spaceY={4} pl={4} borderLeft="1px solid" borderColor="gray.700">
        <WatchListCheckboxCards movieId={movie.id} />
      </Box>
    );
};

export default OverviewSection;