import { Box } from "@chakra-ui/react"

import { CollectionsInterface } from "~/interfaces/collections";
import CollectionsHero from "~/components/collections/collectionHero";
import { CollectionTable } from "~/components/collections/displays/collection-table";


export default function CollectionDashboard({ collection}: {collection: CollectionsInterface}) {
  return (
    <Box position="relative" flex={1} overflow="auto" height="calc(100vh - 100px)">
      <Box width="100%" top={10} zIndex={10}>
        <CollectionsHero collection={collection} height="300px"/>
      </Box>
      <Box as="section" display="grid" gap={12} gridColumn={1} flex="1" overflow="hidden" pt={12} px={8} >
        <CollectionTable collection={collection} />
      </Box>
    </Box>
  );
}