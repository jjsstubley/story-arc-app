import { Box, Heading, Text, Button, IconButton } from "@chakra-ui/react"
import { Link } from "@remix-run/react";
import { Session } from "@supabase/supabase-js";

import { CollectionsInterface } from "~/interfaces/collections";
import { CollectionTable } from "~/components/collections/displays/collection-table";
import ForkCollectionDialog from "~/components/collections/fork-collection-dialog";
import EditCollectionDialog from "~/components/collections/edit-collection-dialog";
import ListHeader from "~/components/lists/list-header";
import { usePosterGradientColor } from "~/hooks/use-poster-gradient-color";
import { HiPencil } from "react-icons/hi";


export default function CollectionDashboard({ collection, error, session}: {collection?: CollectionsInterface, error?: string, session?: Session | null}) {
  const firstMovie = collection?.collection_items?.[0];
  const gradientColor = usePosterGradientColor(
    firstMovie?.movie?.id,
    firstMovie?.movie?.poster_path,
    collection?.id
  );

  if (error || !collection) {
    return (
      <Box position="relative" flex={1} minH="60vh" display="flex" alignItems="center" justifyContent="center">
        <Box textAlign="center" p={8}>
          <Heading size="lg" mb={4}>Collection Not Available</Heading>
          <Text mb={4} color="gray.400">{error || "Collection not found"}</Text>
          {error?.includes("signed in") && (
            <Link to="/auth/login">
              <Button colorPalette="orange">
                Sign In
              </Button>
            </Link>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box position="relative" flex={1}>
      <ListHeader
        eyebrow={collection.is_system_generated ? "Curated collection" : "Collection"}
        title={collection.name}
        description={collection.description}
        createdAt={collection.created_at}
        filmCount={collection.collection_items.length}
        tags={collection.tags}
        posterPaths={collection.collection_items.map((item) => item.movie?.poster_path)}
        backdropPath={firstMovie?.movie?.backdrop_path}
        tint={gradientColor}
        actions={
          <>
            {collection.is_system_generated && session && (
              <ForkCollectionDialog
                sourceCollection={collection}
                trigger={<Button size="sm" variant="solid">Add Collection</Button>}
              />
            )}
            {!collection.is_system_generated && (
              <EditCollectionDialog
                collection={collection}
                trigger={
                  <IconButton variant="subtle" border="1px solid" borderColor="whiteAlpha.300" rounded="full" aria-label="Edit collection" size="sm">
                    <HiPencil />
                  </IconButton>
                }
              />
            )}
          </>
        }
      />
      <Box as="section" display="grid" gap={12} gridColumn={1} flex="1" overflow="hidden" pt={12} px={8} >
        <CollectionTable collection={collection} />
      </Box>
    </Box>
  );
}