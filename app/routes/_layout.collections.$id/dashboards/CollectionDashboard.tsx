import { Box, Button, Heading, Text } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { CollectionView, type CollectionWithMovies } from "~/features/collections";

interface CollectionDashboardProps {
  collection: CollectionWithMovies | null;
  viewerId: string | null;
  error: string | null;
}

export default function CollectionDashboard({ collection, viewerId, error }: CollectionDashboardProps) {
  if (!collection) {
    return (
      <Box flex={1} minH="60vh" display="flex" alignItems="center" justifyContent="center">
        <Box textAlign="center" p={8}>
          <Heading size="lg" fontWeight="light" mb={4}>Collection not available</Heading>
          <Text mb={4} color="fg.muted">{error}</Text>
          {!viewerId && (
            <Link to="/auth/login">
              <Button colorPalette="orange">Sign in</Button>
            </Link>
          )}
        </Box>
      </Box>
    );
  }

  return <CollectionView key={collection.id} collection={collection} viewerId={viewerId} />;
}
