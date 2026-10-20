import { Button, HStack, Text } from "@chakra-ui/react";
import { getErrorMessage } from "~/shared/errors";

interface InlineErrorProps {
  /** Shown when the error has no user-facing message */
  fallback: string;
  error?: unknown;
  onRetry?: () => void;
}

/** Standard error display for a component whose query failed */
export function InlineError({ fallback, error, onRetry }: InlineErrorProps) {
  return (
    <HStack justify="space-between" gap={3} p={3} rounded="md" bg="red.subtle" role="alert">
      <Text fontSize="sm" color="red.fg">
        {getErrorMessage(error, fallback)}
      </Text>
      {onRetry && (
        <Button size="xs" variant="outline" colorPalette="red" onClick={onRetry}>
          Retry
        </Button>
      )}
    </HStack>
  );
}
