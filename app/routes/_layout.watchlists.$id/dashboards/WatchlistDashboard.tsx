import { Box, IconButton, Text, VStack } from "@chakra-ui/react"
import BackButton from "~/components/backButton";

import { WatchlistTable } from "~/components/watchlist/displays/watchlist-table";
import { WatchlistInterface } from "~/interfaces/watchlist";
import EditWatchlistDialog from "~/components/watchlist/edit-watchlist-dialog";
import { useSeenCount } from "~/components/watchlist/use-seen-count";
import ListHeader from "~/components/lists/list-header";
import { usePosterGradientColor } from "~/hooks/use-poster-gradient-color";
import { HiPencil } from "react-icons/hi";


export default function WatchlistDashboard({ watchlist, error}: {watchlist?: WatchlistInterface | null, error?: string}) {
  const firstMovie = watchlist?.watchlist_items?.[0];
  const gradientColor = usePosterGradientColor(
    firstMovie?.movie?.id,
    firstMovie?.movie?.poster_path,
    undefined
  );
  const items = watchlist?.watchlist_items ?? [];
  const seenCount = useSeenCount(items, watchlist?.id ?? "");

  // Handle error state
  if (error) {
    return (
      <Box position="relative" flex={1}>
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
      <Box position="relative" flex={1}>
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
    <Box position="relative" flex={1}>
      <ListHeader
        eyebrow={watchlist.is_default ? "Your watchlist" : "Watchlist"}
        title={watchlist.name}
        description={watchlist.descriptions}
        createdAt={watchlist.created_at}
        filmCount={items.length}
        progress={{ seen: seenCount, total: items.length }}
        tags={watchlist.tags}
        posterPaths={items.map((item) => item.movie?.poster_path ?? item.series?.poster_path)}
        backdropPath={firstMovie?.movie?.backdrop_path ?? firstMovie?.series?.backdrop_path}
        tint={gradientColor}
        leading={<BackButton />}
        actions={
          <EditWatchlistDialog
            watchlist={watchlist}
            trigger={
              <IconButton variant="subtle" border="1px solid" borderColor="whiteAlpha.300" rounded="full" aria-label="Edit watchlist" size="sm">
                <HiPencil />
              </IconButton>
            }
          />
        }
      />
      <Box as="section" display="grid" gap={12} gridColumn={1} flex="1" overflow="hidden" pt={12} px={8} >
        <WatchlistTable watchlist={watchlist} />
      </Box>
    </Box>
  );
}