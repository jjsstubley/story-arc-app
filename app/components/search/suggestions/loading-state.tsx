import { Box, Spinner, Text, VStack } from "@chakra-ui/react";

const LoadingState = () => {
  return (
    <Box
      height="400px"
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={6}
    >
      <VStack gap={4}>
        <Spinner
          size="xl"
          color="orange.500"
          thickness="4px"
          speed="0.65s"
        />
        <Text fontSize="sm" color="fg.muted">
          Finding the perfect recommendations...
        </Text>
      </VStack>
    </Box>
  );
};

export default LoadingState;

