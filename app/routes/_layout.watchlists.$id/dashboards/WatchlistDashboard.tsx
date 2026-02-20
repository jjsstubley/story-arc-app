import { Box, Text, VStack } from "@chakra-ui/react"
import BackButton from "~/components/backButton";

import { WatchlistTable } from "~/components/watchlist/displays/watchlist-table";
import { WatchlistInterface } from "~/interfaces/watchlist";
import WatchlistHero from "~/components/watchlist/watchlistHero";


export default function WatchlistDashboard({ watchlist, error}: {watchlist?: WatchlistInterface | null, error?: string}) {
  // Handle error state
  if (error) {
    return (
      <Box position="relative" flex={1} overflow="auto" height="calc(100vh - 100px)">
        <Box position="absolute" top={5} left={5} zIndex={1}>
          <BackButton />
        </Box>
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          height="100%" 
          p={8}
        >
          <VStack gap={4} textAlign="center" maxW="400px">
            <Text fontSize="lg" fontWeight="semibold" color="fg.default">
              Unable to load watchlist
            </Text>
            <Text fontSize="sm" color="fg.muted">
              {error}
            </Text>
          </VStack>
        </Box>
      </Box>
    );
  }

  // Handle null watchlist (shouldn't happen with fixed getPopcornWatchlistWMovies, but safety check)
  if (!watchlist) {
    return (
      <Box position="relative" flex={1} overflow="auto" height="calc(100vh - 100px)">
        <Box position="absolute" top={5} left={5} zIndex={1}>
          <BackButton />
        </Box>
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          height="100%" 
          p={8}
        >
          <VStack gap={4} textAlign="center" maxW="400px">
            <Text fontSize="lg" fontWeight="semibold" color="fg.default">
              Watchlist not found
            </Text>
            <Text fontSize="sm" color="fg.muted">
              The watchlist you're looking for doesn't exist or has been removed.
            </Text>
          </VStack>
        </Box>
      </Box>
    );
  }

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