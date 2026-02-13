import { Box, Button, CloseButton, Dialog, Portal, Text } from "@chakra-ui/react";
import { YouTubeEmbed } from "~/components/embeds/youtube";
import { VideoItemInterface } from "~/interfaces/tmdb/videos";

const InfoPanelTrailer = ({trailer} : { trailer: VideoItemInterface }) => {

    return (
      <Dialog.Root size="xl">
        <Dialog.Trigger asChild>
            <Box display="flex" flexDirection="column" gap={2}>
                <Text fontSize="xs" color="whiteAlpha.600" whiteSpace="nowrap">{trailer.name}</Text>
                <Button variant="subtle" size="sm" colorPalette="orange" width="100%">
                    <Box display="flex" flexDirection="column" alignItems="flex-start">
                        <Text fontSize="xs" color="whiteAlpha.600" whiteSpace="nowrap">Watch trailer</Text>
                    </Box>
                </Button>
            </Box>
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>{trailer.name}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <YouTubeEmbed url={trailer.key} />
              </Dialog.Body>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    );
};

export default InfoPanelTrailer;