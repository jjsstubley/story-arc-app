import { Box, Text, VStack } from "@chakra-ui/react"
import { useRef } from "react";
import BackButton from "~/components/backButton";

import { WatchlistTable } from "~/components/watchlist/displays/watchlist-table";
import { WatchlistInterface } from "~/interfaces/watchlist";
import WatchlistHero from "~/components/watchlist/watchlistHero";
import FixedWatchlistHeader from "~/components/watchlist/fixed-watchlist-header";
import { useScrollVisibility } from "~/hooks/use-scroll-visibility";
import { usePosterGradientColor } from "~/hooks/use-poster-gradient-color";


export default function WatchlistDashboard({ watchlist, error}: {watchlist?: WatchlistInterface | null, error?: string}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const shouldShowFixedHeader = useScrollVisibility(titleRef);
  
  const firstMovie = watchlist?.watchlist_items?.[0];
  const gradientColor = usePosterGradientColor(
    firstMovie?.movie?.id,
    firstMovie?.movie?.poster_path,
    undefined
  );

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
      {shouldShowFixedHeader && (
        <FixedWatchlistHeader
          watchlist={watchlist}
          gradientColor={gradientColor}
        />
      )}
      <Box width="100%" top={10} zIndex={10}>
        <Box position="absolute" top={5} left={5} zIndex={1}>
          <BackButton />
        </Box>
        <WatchlistHero ref={titleRef} watchlist={watchlist} height="300px"/>
      </Box>
      <Box as="section" display="grid" gap={12} gridColumn={1} flex="1" overflow="hidden" pt={12} px={8} >
        <WatchlistTable watchlist={watchlist} />
      </Box>
    </Box>
  );
}