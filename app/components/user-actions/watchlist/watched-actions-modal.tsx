import { 
  Dialog, 
  Button, 
  VStack, 
  HStack, 
  Text, 
  Box, 
  Portal,
  CloseButton
} from "@chakra-ui/react";
import { LuHeart, LuStar, LuClock } from "react-icons/lu";

export default function MovieActionsDialog({children}: {children: React.ReactNode}) {

  return (
    <Dialog.Root size="lg">
        <Dialog.Trigger asChild>
            {children}
        </Dialog.Trigger>
        <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
            <Dialog.Content>
                <Dialog.Header>
                    <Dialog.Title>Share your thoughts or add to your favorites</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                    <VStack gap={4} align="stretch">
                        {/* Favorites Section */}
                        <Box p={4} border="1px solid" borderColor="gray.200" rounded="md">
                            <HStack justify="space-between" align="center">
                                <VStack align="start" gap={1}>
                                    <Text fontWeight="semibold">Add to Favorites</Text>
                                    <Text fontSize="sm" color="gray.600">
                                    Save this movie to your favorites list
                                    </Text>
                                </VStack>
                                <Button variant="outline" colorScheme="pink" width="170px">
                                    <LuHeart color="pink" /> Add to Favorites
                                </Button>
                            </HStack>
                        </Box>

                        {/* Review Section */}
                        <Box p={4} border="1px solid" borderColor="gray.200" rounded="md">
                            <VStack align="start" gap={3}>
                                <HStack justify="space-between" align="center" w="100%">
                                    <VStack align="start" gap={1}>
                                        <Text fontWeight="semibold">Write a Review</Text>
                                        <Text fontSize="sm" color="gray.600">
                                            Rate and review this movie
                                        </Text>
                                    </VStack>
                                    <Button width="170px">
                                        <LuStar /> Write Review
                                    </Button>
                                </HStack>
                            </VStack>
                        </Box>

                        {/* Do Later Section */}
                        <Box p={4} border="1px solid" borderColor="gray.200" rounded="md">
                            <HStack justify="space-between" align="center">
                                <VStack align="start" gap={1}>
                                    <Text fontWeight="semibold">Do Later</Text>
                                    <Text fontSize="sm" color="gray.600">
                                    Add to your &quotdo later&quot list
                                    </Text>
                                </VStack>
                                <Button variant="outline" width="170px">
                                    <LuClock /> Save Review
                                </Button>
                            </HStack>
                        </Box>
                    </VStack>
                </Dialog.Body>
                <Dialog.Footer>
                    <Dialog.ActionTrigger asChild>
                        <Button variant="outline">Cancel</Button>
                    </Dialog.ActionTrigger>
                    <Button>Save</Button>
                </Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                </Dialog.CloseTrigger>
            </Dialog.Content>
        </Dialog.Positioner>
        </Portal>
  </Dialog.Root>
  );
}