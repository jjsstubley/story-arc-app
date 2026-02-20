import { Box } from "@chakra-ui/react"
import BackButton from "~/components/backButton";

import { WatchlistTable } from "~/components/watchlist/displays/watchlist-table";
import { WatchlistInterface } from "~/interfaces/watchlist";
import WatchlistHero from "~/components/watchlist/watchlistHero";


export default function WatchlistDashboard({ watchlist}: {watchlist: WatchlistInterface}) {
  return (
    <Box position="relative" flex={1} overflow="auto" height="calc(100vh - 100px)">
      <Box width="100%" top={10} zIndex={10}>
        <Box position="absolute" top={5} left={5} zIndex={1}>
          <BackButton />
        </Box>
        <WatchlistHero watchlist={watchlist} height="300px"/>
      </Box>
      <Box as="section" display="grid" gap={12} gridColumn={1} flex="1" overflow="hidden" pt={12} px={8} >
        <WatchlistTable watchlist={watchlist} />
      </Box>
    </Box>
  );
}