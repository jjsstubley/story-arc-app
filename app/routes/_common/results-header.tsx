import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import SortMenu from "~/components/search/filters/sort-menu";
import { formatReadableNumber } from "~/utils/helpers";

interface ResultsHeaderProps {
  /** Small label above the title, e.g. "Genre" */
  eyebrow?: string;
  title: string;
  totalResults?: number;
  /** TMDB backdrop path used as the header's background */
  backdropPath?: string | null;
  sort: string;
  onSortChange: (sort: string) => void;
  /** Shrinks the header once the results have scrolled under it */
  compact: boolean;
}

/**
 * Sticky header for a results grid. Must be the first child of the scroll
 * container, which is expected to have `p={4}` (the header bleeds over it).
 */
export default function ResultsHeader({ eyebrow, title, totalResults, backdropPath, sort, onSortChange, compact }: ResultsHeaderProps) {
  return (
    <Box
      position="sticky"
      // Sticky offsets are measured inside the container's padding, so cancel it
      top={-4}
      zIndex="docked"
      mx={-4}
      mt={-4}
      mb={4}
      overflow="hidden"
      bg="bg.muted"
      borderBottom="1px solid"
      borderColor={compact ? "whiteAlpha.200" : "transparent"}
      shadow={compact ? "lg" : "none"}
      transition="border-color 0.2s, box-shadow 0.2s"
    >
      {backdropPath && (
        <Box
          position="absolute"
          inset={0}
          bgImage={`url(https://image.tmdb.org/t/p/w1280${backdropPath})`}
          bgSize="cover"
          bgPos="center 30%"
          filter="grayscale(70%)"
          opacity={compact ? 0.35 : 0.6}
          transition="opacity 0.3s"
        />
      )}
      {/* Fade the image into the panel so the text stays readable */}
      <Box position="absolute" inset={0} bgGradient="to-t" gradientFrom="bg.muted" gradientVia="bg.muted/70" gradientTo="bg.muted/10" />
      <Box position="absolute" left={0} top={0} bottom={0} width="4px" bg="orange.400" />

      <Flex
        position="relative"
        px={{ base: 5, md: 8 }}
        pt={compact ? 3 : { base: 10, md: 16 }}
        pb={compact ? 3 : 6}
        gap={4}
        align={compact ? "center" : "flex-end"}
        justify="space-between"
        wrap="wrap"
        transition="padding 0.3s"
      >
        <Box minW={0} flex="1">
          {eyebrow && !compact && (
            <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="0.3em" color="orange.400" mb={2}>
              {eyebrow}
            </Text>
          )}
          <Heading
            as="h1"
            fontSize={compact ? "xl" : { base: "4xl", md: "6xl" }}
            lineHeight="1"
            fontWeight="light"
            letterSpacing="0.08em"
            textShadow="0 2px 12px rgba(0,0,0,0.6)"
            truncate
            transition="font-size 0.3s"
          >
            {title}
          </Heading>
          {totalResults !== undefined && !compact && (
            <Text fontSize="sm" color="fg.muted" mt={3}>
              {formatReadableNumber(totalResults)} films
            </Text>
          )}
        </Box>
        <Box width={compact ? { base: "160px", sm: "200px" } : { base: "100%", sm: "200px" }} flexShrink={0}>
          <SortMenu value={sort} onChange={(val) => onSortChange(val[0])} />
        </Box>
      </Flex>
    </Box>
  );
}
