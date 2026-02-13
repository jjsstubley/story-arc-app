"use client"

import { useEffect, useState } from "react";
import { Link } from "@remix-run/react";
import { Box, Stack, Text, Heading, VStack } from "@chakra-ui/react";
import { CollectionsInterface } from "~/interfaces/collections";
import { BsCollection } from "react-icons/bs";

export default function CollectionsList() {
  const [collections, setCollections] = useState<CollectionsInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCollections = async () => {
    try {
      const response = await fetch("/api/collections");
      if (response.ok) {
        const data = await response.json();
        setCollections(data.collections || []);
      }
    } catch (error) {
      console.error("Failed to fetch collections:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  if (isLoading) {
    return <Text fontSize="sm" color="fg.muted">Loading collections...</Text>;
  }

  if (collections.length === 0) {
    return (
      <Box>
        <Text fontSize="sm" color="fg.muted">No collections yet. Fork a collection to get started!</Text>
      </Box>
    );
  }

  return (
    <VStack gap={2} align="stretch">
      {collections.map((collection) => (
        <Link key={collection.id} to={`/collections/${collection.id}`}>
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
                  {collection.name}
                </Heading>
              </Box>
              {collection.description && (
                <Text fontSize="xs" color="fg.muted" noOfLines={1}>
                  {collection.description}
                </Text>
              )}
              <Text fontSize="xs" color="fg.muted">
                {collection.collection_items?.length || 0} movies
              </Text>
            </Stack>
          </Box>
        </Link>
      ))}
    </VStack>
  );
}

