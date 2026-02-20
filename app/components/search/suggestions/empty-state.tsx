import { Box, Text, VStack, Icon } from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";

interface EmptyStateProps {
  message?: string;
  query?: string;
}

const EmptyState = ({ message, query }: EmptyStateProps) => {
  return (
    <Box
      height="400px"
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={6}
    >
      <VStack gap={4} textAlign="center" maxW="400px">
        <Icon
          as={FiSearch}
          boxSize={12}
          color="fg.muted"
        />
        <VStack gap={2}>
          <Text fontSize="lg" fontWeight="semibold" color="fg.default">
            {message || "No recommendations found"}
          </Text>
          {query && (
            <Text fontSize="sm" color="fg.muted" lineHeight="tall">
              We couldn&apos;t find any recommendations for &quot;{query}&quot;. Try a different search term.
            </Text>
          )}
          {!query && (
            <Text fontSize="sm" color="fg.muted" lineHeight="tall">
              Try searching with a different description or query.
            </Text>
          )}
        </VStack>
      </VStack>
    </Box>
  );
};

export default EmptyState;

