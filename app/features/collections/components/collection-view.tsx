import { Box, Button, IconButton } from "@chakra-ui/react";
import { HiPencil } from "react-icons/hi";
import ListHeader from "~/components/lists/list-header";
import { usePosterGradientColor } from "~/hooks/use-poster-gradient-color";
import { useCollection } from "../queries";
import type { CollectionWithMovies } from "../types";
import CollectionTable from "./collection-table";
import EditCollectionDialog from "./edit-collection-dialog";
import ForkCollectionDialog from "./fork-collection-dialog";

interface CollectionViewProps {
  /** Loaded by the page's loader; seeds the query so edits update the page */
  collection: CollectionWithMovies;
  /** The signed-in user's id, if any */
  viewerId: string | null;
}

function eyebrowFor(collection: CollectionWithMovies) {
  if (collection.is_public) return "Curated collection";
  if (collection.is_system_generated) return "Generated for you";
  return "Your collection";
}

export default function CollectionView({ collection: initialData, viewerId }: CollectionViewProps) {
  const { data } = useCollection(initialData.id, { initialData });
  const collection = data ?? initialData;
  const isOwner = Boolean(viewerId) && collection.user_id === viewerId;
  const firstMovie = collection.collection_items.find((item) => item.movie)?.movie;
  const tint = usePosterGradientColor(firstMovie?.id, firstMovie?.poster_path, collection.id);

  return (
    <Box position="relative" flex={1}>
      <ListHeader
        eyebrow={eyebrowFor(collection)}
        title={collection.name}
        description={collection.description}
        createdAt={collection.created_at}
        filmCount={collection.collection_items.length}
        tags={collection.tags}
        posterPaths={collection.collection_items.map((item) => item.movie?.poster_path)}
        backdropPath={firstMovie?.backdrop_path}
        tint={tint}
        actions={
          <>
            {viewerId && !isOwner && (
              <ForkCollectionDialog
                sourceCollection={collection}
                trigger={<Button size="sm" variant="solid">Add to my collections</Button>}
              />
            )}
            {isOwner && (
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
      <Box as="section" pt={8} px={{ base: 4, md: 8 }} pb={8}>
        <CollectionTable collection={collection} isOwner={isOwner} />
      </Box>
    </Box>
  );
}
