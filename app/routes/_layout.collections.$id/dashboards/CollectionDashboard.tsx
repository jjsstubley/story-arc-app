import { Box, Heading, Text, Button } from "@chakra-ui/react"
import { Link } from "@remix-run/react";
import { Session } from "@supabase/supabase-js";

import { CollectionsInterface } from "~/interfaces/collections";
import CollectionsHero from "~/components/collections/collectionHero";
import { CollectionTable } from "~/components/collections/displays/collection-table";


export default function CollectionDashboard({ collection, error, session}: {collection?: CollectionsInterface, error?: string, session?: Session | null}) {
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
      <Box width="100%" top={10} zIndex={10}>
        <CollectionsHero collection={collection} height="300px" session={session}/>
      </Box>
      <Box as="section" display="grid" gap={12} gridColumn={1} flex="1" overflow="hidden" pt={12} px={8} >
        <CollectionTable collection={collection} />
      </Box>
    </Box>
  );
}