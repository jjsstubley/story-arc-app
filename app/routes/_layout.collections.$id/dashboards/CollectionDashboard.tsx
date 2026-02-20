import { Box, Heading, Text, Button } from "@chakra-ui/react"
import { Link } from "@remix-run/react";
import { Session } from "@supabase/supabase-js";
import { useRef } from "react";

import { CollectionsInterface } from "~/interfaces/collections";
import CollectionsHero from "~/components/collections/collectionHero";
import { CollectionTable } from "~/components/collections/displays/collection-table";
import FixedCollectionHeader from "~/components/collections/fixed-collection-header";
import { useScrollVisibility } from "~/hooks/use-scroll-visibility";
import { usePosterGradientColor } from "~/hooks/use-poster-gradient-color";


export default function CollectionDashboard({ collection, error, session}: {collection?: CollectionsInterface, error?: string, session?: Session | null}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const shouldShowFixedHeader = useScrollVisibility(titleRef);
  
  const firstMovie = collection?.collection_items?.[0];
  const gradientColor = usePosterGradientColor(
    firstMovie?.movie?.id,
    firstMovie?.movie?.poster_path,
    collection?.id
  );

  if (error || !collection) {
    return (
      <Box position="relative" flex={1} overflow="auto" height="calc(100vh - 100px)" display="flex" alignItems="center" justifyContent="center">
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
    <Box position="relative" flex={1} overflow="auto" height="calc(100vh - 100px)">
      {shouldShowFixedHeader && (
        <FixedCollectionHeader
          collection={collection}
          gradientColor={gradientColor}
          session={session}
        />
      )}
      <Box width="100%" top={10} zIndex={10}>
        <CollectionsHero ref={titleRef} collection={collection} height="300px" session={session}/>
      </Box>
      <Box as="section" display="grid" gap={12} gridColumn={1} flex="1" overflow="hidden" pt={12} px={8} >
        <CollectionTable collection={collection} />
      </Box>
    </Box>
  );
}