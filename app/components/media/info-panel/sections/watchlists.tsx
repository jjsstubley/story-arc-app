import { Box } from "@chakra-ui/react";
import { WatchlistPicker } from "~/features/watchlists";


const WatchListSection = ({movieId} : { movieId: number }) => {
    return (
        <Box listStyle="none" padding={0} margin={0} spaceY={4} pl={4} borderLeft="1px solid" borderColor="gray.700">
            <WatchlistPicker movieId={movieId} />
        </Box>
    );
};

export default WatchListSection;