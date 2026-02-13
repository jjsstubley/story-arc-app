import { Box, CloseButton, Dialog, Heading } from '@chakra-ui/react';

const SuggestionsDialogHeader = ({query} : { query: string }) => {

    return (
        <Box position="relative" flex={1} height="100%">
            
            <Heading as="h2">Result for &quot;{ query }&quot;</Heading>
            <Dialog.CloseTrigger asChild >
                <CloseButton size="sm" />
            </Dialog.CloseTrigger>
        </Box>
    );
};

export default SuggestionsDialogHeader;