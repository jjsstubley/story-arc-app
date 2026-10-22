import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";

interface PageSectionProps {
  /** Anchor for jump links; also gets scroll margin so a sticky bar doesn't cover the heading */
  id?: string;
  /** Small orange label above the title */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  count?: number;
  /** Shown at the end of the heading row, e.g. a "View all" link */
  action?: ReactNode;
  children: ReactNode;
}

/** Section heading in the app's light, widely spaced style, used on overview pages */
export function PageSection({ id, eyebrow, title, subtitle, count, action, children }: PageSectionProps) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <Box as="section" id={id} scrollMarginTop="88px" aria-labelledby={headingId}>
      <Flex align="flex-end" justify="space-between" gap={4} mb={5}>
        <Box minW={0}>
          {eyebrow && (
            <Text fontSize="2xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="0.3em" color="orange.400" mb={1}>
              {eyebrow}
            </Text>
          )}
          <Flex align="baseline" gap={3}>
            <Heading id={headingId} as="h3" fontSize="2xl" fontWeight="light" letterSpacing="0.06em" truncate>
              {title}
            </Heading>
            {count !== undefined && <Text fontSize="sm" color="orange.400" fontWeight="semibold">{count}</Text>}
          </Flex>
          {subtitle && <Text fontSize="sm" color="fg.muted" mt={1}>{subtitle}</Text>}
        </Box>
        {action && <Box flexShrink={0}>{action}</Box>}
      </Flex>
      {children}
    </Box>
  );
}
