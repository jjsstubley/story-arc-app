"use client"

import { Link } from "@remix-run/react";
import { Box, Stack, Text, Heading, VStack, Skeleton } from "@chakra-ui/react";
import { BsCollection } from "react-icons/bs";
import { useWatchlists } from "~/features/watchlists";
import { InlineError } from "~/shared/ui/inline-error";

export default function CollectionsList() {
  const { data: watchlists, isPending, error, refetch } = useWatchlists();

  if (isPending) {
    return (
      <VStack gap={2} align="stretch">
        {[0, 1].map((row) => <Skeleton key={row} height="76px" rounded="md" />)}
      </VStack>
    );
  }

  if (error) {
    return <InlineError fallback="Couldn't load your watchlists." error={error} onRetry={() => refetch()} />;
  }

  if (watchlists.length === 0) {
    return (
      <Box>
        <Text fontSize="sm" color="fg.muted">No collections yet. Create a watchlist to get started!</Text>
      </Box>
    );
  }

  return (
    <VStack gap={2} align="stretch">
      {watchlists.map((watchlist) => (
        <Link key={watchlist.id} to={`/watchlists/${watchlist.id}`}>
          <Box
            p={3}
            rounded="md"
            border="1px solid"
            borderColor="gray.700"
            _hover={{ bg: "gray.800", borderColor: "orange.500" }}
            transition="all 0.2s"
          >
            <Stack gap={1}>
              <Box display="flex" gap={2} alignItems="center">
                <BsCollection color="whiteAlpha.600" size={16} />
                <Heading as="h4" size="sm" fontWeight="semibold">
                  {watchlist.name}
                </Heading>
              </Box>
              {watchlist.descriptions && (
                <Text fontSize="xs" color="fg.muted" noOfLines={1}>
                  {watchlist.descriptions}
                </Text>
              )}
              <Text fontSize="xs" color="fg.muted">
                {watchlist.item_count} movies
              </Text>
            </Stack>
          </Box>
        </Link>
      ))}
    </VStack>
  );
}


