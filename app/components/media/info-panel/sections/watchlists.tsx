import { Box } from "@chakra-ui/react";
import WatchListCheckboxCards from "~/components/user-actions/watchlist/checkbox-cards";


const WatchListSection = ({movieId} : { movieId: number }) => {
    return (
        <Box listStyle="none" padding={0} margin={0} spaceY={4} pl={4} borderLeft="1px solid" borderColor="gray.700">
            <WatchListCheckboxCards movieId={movieId} />
        </Box>
    );
};

export default WatchListSection;