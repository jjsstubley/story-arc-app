// components/CustomDialog.tsx
import {
  Box,
  Heading,
} from '@chakra-ui/react';

export function Section({ title, children }: { title: string, children: React.ReactNode}) {
  return (
    <Box flex="1" overflow="hidden">
      <Heading as="h3" pb={4}>{ title }</Heading>
      { children}
    </Box> 
  );
}