"use client"

import { useEffect, useState } from "react";
import { Link } from "@remix-run/react";
import { Box, Stack, Text, Heading, VStack } from "@chakra-ui/react";
import { WatchlistInterface } from "~/interfaces/watchlist";
import { BsCollection } from "react-icons/bs";

export default function CollectionsList() {
  const [watchlists, setWatchlists] = useState<WatchlistInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWatchlists = async () => {
    try {
      const response = await fetch("/api/watchlists");
      if (response.ok) {
        const data = await response.json();
        // Filter to include default watchlist and user-created watchlists
        const allWatchlists = data.watchlist || [];
        setWatchlists(allWatchlists);
      }
    } catch (error) {
      console.error("Failed to fetch watchlists:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlists();
  }, []);

  if (isLoading) {
    return <Text fontSize="sm" color="fg.muted">Loading collections...</Text>;
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
                {watchlist.watchlist_items?.length || 0} movies
              </Text>
            </Stack>
          </Box>
        </Link>
      ))}
    </VStack>
  );
}


