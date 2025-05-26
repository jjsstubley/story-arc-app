// components/CustomDialog.tsx
import {
  HoverCard as ChakraHoverCard,
  Portal,
} from '@chakra-ui/react';

import type { TabsRootProps as ChakraTabsRootProps } from '@chakra-ui/react';

type CustomDialogProps = {
  trigger: React.ReactNode;
  content: React.ReactNode;
  dialogProps?: Partial<ChakraTabsRootProps>;
};

export function CustomHoverCard({ trigger, content, dialogProps }: CustomDialogProps) {
  return (
    <ChakraHoverCard.Root {...dialogProps}>
      <ChakraHoverCard.Trigger asChild>{trigger}</ChakraHoverCard.Trigger>
      <Portal>
        <ChakraHoverCard.Positioner>
          <ChakraHoverCard.Content>
            <ChakraHoverCard.Content>{content}</ChakraHoverCard.Content>
          </ChakraHoverCard.Content>
        </ChakraHoverCard.Positioner>
      </Portal>
    </ChakraHoverCard.Root>
  );
}