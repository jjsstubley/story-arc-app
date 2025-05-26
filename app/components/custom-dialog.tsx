// components/CustomDialog.tsx
import {
  Dialog as ChakraDialog,
  Portal,
} from '@chakra-ui/react';

import type { DialogRootProps as ChakraDialogRootProps } from '@chakra-ui/react';

type CustomDialogProps = {
  trigger: React.ReactNode;
  header: React.ReactNode;
  body: React.ReactNode;
  footer?: React.ReactNode;
  dialogProps?: Partial<ChakraDialogRootProps>;
};

export function CustomDialog({ trigger, header, body, footer, dialogProps }: CustomDialogProps) {
  return (
    <ChakraDialog.Root {...dialogProps}>
      <ChakraDialog.Trigger>{trigger}</ChakraDialog.Trigger>
      <Portal>
        <ChakraDialog.Backdrop />
        <ChakraDialog.Positioner>
          <ChakraDialog.Content overflowY="auto">
            <ChakraDialog.Header>{header}</ChakraDialog.Header>
            <ChakraDialog.Body>{body}</ChakraDialog.Body>
            <ChakraDialog.Footer>{footer}</ChakraDialog.Footer>
          </ChakraDialog.Content>
        </ChakraDialog.Positioner>
      </Portal>
    </ChakraDialog.Root>
  );
}