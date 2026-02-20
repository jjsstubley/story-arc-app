import { Box, Text, VStack, Icon } from "@chakra-ui/react";
import { FiAlertCircle } from "react-icons/fi";

interface ErrorStateProps {
  error?: string;
  onRetry?: () => void;
}

const ErrorState = ({ error, onRetry }: ErrorStateProps) => {
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
          as={FiAlertCircle}
          boxSize={12}
          color="red.500"
        />
        <VStack gap={2}>
          <Text fontSize="lg" fontWeight="semibold" color="fg.default">
            Unable to fetch recommendations
          </Text>
          <Text fontSize="sm" color="fg.muted" lineHeight="tall">
            {error || "Something went wrong while fetching AI suggestions. Please try again."}
          </Text>
        </VStack>
        {onRetry && (
          <Text
            as="button"
            fontSize="sm"
            color="orange.500"
            textDecoration="underline"
            onClick={onRetry}
            _hover={{ color: "orange.600" }}
          >
            Try again
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default ErrorState;

