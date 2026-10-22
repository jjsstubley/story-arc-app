import { Badge, Box, Button, Flex, Heading, HStack, Image, Progress, Text, Wrap } from "@chakra-ui/react";
import { useState, type ReactNode } from "react";
import { useScrolledPast } from "~/hooks/use-scrolled-past";
import { getFormattedDate } from "~/utils/helpers";

const VISIBLE_TAGS = 8;

interface ListHeaderProps {
  /** Small label above the title, e.g. "Collection" */
  eyebrow: string;
  title: string;
  description?: string | null;
  createdAt: string;
  filmCount: number;
  /** Watched progress, for lists the user works through */
  progress?: { seen: number; total: number };
  tags?: string[];
  /** Posters of the first few items, fanned out beside the title */
  posterPaths: (string | null | undefined)[];
  backdropPath?: string | null;
  /** Colour sampled from the first poster, used to tint the hero */
  tint: string;
  /** Buttons shown top-right and in the sticky bar */
  actions?: ReactNode;
  /** Shown top-left of the hero, e.g. a back button */
  leading?: ReactNode;
}

/**
 * Hero for a collection or watchlist page, plus a compact bar that slides in
 * once the title scrolls away. Render it as the first child of the page so
 * the bar can stick to the top of the scrolling area.
 */
export default function ListHeader(props: ListHeaderProps) {
  const { sentinelRef, anchorRef, scrolledPast } = useScrolledPast();

  return (
    <>
      <Box ref={anchorRef} position="sticky" top={0} height={0} zIndex="sticky">
        <ListStickyBar {...props} visible={scrolledPast} />
      </Box>
      <ListHero {...props} />
      <Box ref={sentinelRef} height={0} />
    </>
  );
}

function ListHero({ eyebrow, title, description, createdAt, filmCount, progress, tags = [], posterPaths, backdropPath, tint, actions, leading }: ListHeaderProps) {
  const [showAllTags, setShowAllTags] = useState(false);
  const posters = posterPaths.filter((path): path is string => Boolean(path)).slice(0, 3);
  const visibleTags = showAllTags ? tags : tags.slice(0, VISIBLE_TAGS);
  const created = getFormattedDate({ release_date: createdAt, options: { year: "numeric", month: "long", day: "numeric" }, region: "en-US" });

  return (
    <Box position="relative" overflow="hidden" bg="bg.muted">
      {backdropPath && (
        <Box
          position="absolute"
          inset={0}
          bgImage={`url(https://image.tmdb.org/t/p/w1280${backdropPath})`}
          bgSize="cover"
          bgPos="center 30%"
          filter="grayscale(40%)"
          opacity={0.45}
        />
      )}
      <Box position="absolute" inset={0} bgGradient="to-br" gradientFrom={tint} gradientTo="transparent" opacity={0.75} />
      <Box position="absolute" inset={0} bgGradient="to-t" gradientFrom="bg.muted" gradientVia="bg.muted/60" gradientTo="transparent" />
      <Box position="absolute" left={0} top={0} bottom={0} width="4px" bg="orange.400" />

      <Flex position="relative" justify="space-between" align="center" px={{ base: 3, md: 6 }} pt={4} minH="48px">
        <Box>{leading}</Box>
        <HStack gap={2}>{actions}</HStack>
      </Flex>

      <Flex position="relative" px={{ base: 5, md: 8 }} pt={{ base: 4, md: 8 }} pb={8} gap={8} align="flex-end">
        <Box flex={1} minW={0}>
          <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="0.3em" color="orange.400" mb={2}>
            {eyebrow}
          </Text>
          <Heading
            as="h1"
            fontSize={{ base: "4xl", md: "6xl" }}
            lineHeight="1.05"
            fontWeight="light"
            letterSpacing="0.06em"
            textShadow="0 2px 12px rgba(0,0,0,0.6)"
            lineClamp={2}
          >
            {title}
          </Heading>
          {description && (
            <Text mt={4} color="whiteAlpha.800" maxW="60ch" lineClamp={3}>
              {description}
            </Text>
          )}
          <HStack mt={4} gap={2} fontSize="sm" color="fg.muted" wrap="wrap">
            <Text>{filmCount} {filmCount === 1 ? "film" : "films"}</Text>
            <Text aria-hidden>·</Text>
            <Text>Created {created}</Text>
          </HStack>

          {progress && progress.total > 0 && <ListProgress {...progress} />}

          {tags.length > 0 && (
            <Wrap mt={5} gap={2}>
              {visibleTags.map((tag) => (
                <Badge key={tag} variant="outline" colorPalette="orange" rounded="full" px={3} bg="blackAlpha.400">
                  {tag}
                </Badge>
              ))}
              {tags.length > VISIBLE_TAGS && (
                <Button size="2xs" variant="ghost" colorPalette="orange" rounded="full" onClick={() => setShowAllTags(!showAllTags)}>
                  {showAllTags ? "Show less" : `+${tags.length - VISIBLE_TAGS} more`}
                </Button>
              )}
            </Wrap>
          )}
        </Box>

        {posters.length > 0 && <PosterFan posters={posters} />}
      </Flex>
    </Box>
  );
}

function ListProgress({ seen, total }: { seen: number; total: number }) {
  const complete = seen === total;
  return (
    <Box mt={4} maxW="320px">
      <HStack justify="space-between" fontSize="xs" color="fg.muted" mb={1}>
        <Text>{seen} of {total} seen</Text>
        {complete && <Badge colorPalette="green" size="sm">List completed</Badge>}
      </HStack>
      <Progress.Root value={(seen / total) * 100} size="xs" colorPalette={complete ? "green" : "orange"}>
        <Progress.Track bg="whiteAlpha.200">
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
    </Box>
  );
}

/** Up to three posters, fanned like a hand of cards */
function PosterFan({ posters }: { posters: string[] }) {
  // Back cards first so the first poster ends up on top
  const layout = [
    { rotate: "-9deg", x: "-56px", y: "10px" },
    { rotate: "9deg", x: "56px", y: "10px" },
    { rotate: "0deg", x: "0px", y: "0px" },
  ];
  const cards = posters.length === 1 ? [layout[2]] : posters.length === 2 ? [layout[0], layout[2]] : layout;
  const ordered = [...posters].reverse();

  return (
    <Box position="relative" width="240px" height="200px" flexShrink={0} display={{ base: "none", md: "block" }}>
      {ordered.map((path, i) => (
        <Image
          key={path}
          src={`https://image.tmdb.org/t/p/w185${path}`}
          alt=""
          position="absolute"
          left="50%"
          bottom={0}
          width="120px"
          aspectRatio={2 / 3}
          objectFit="cover"
          rounded="md"
          outline="1px solid"
          outlineColor="whiteAlpha.300"
          shadow="0 12px 30px rgba(0,0,0,0.6)"
          transform={`translateX(-50%) translate(${cards[i].x}, ${cards[i].y}) rotate(${cards[i].rotate})`}
        />
      ))}
    </Box>
  );
}

function ListStickyBar({ title, eyebrow, filmCount, progress, posterPaths, backdropPath, actions, visible }: ListHeaderProps & { visible: boolean }) {
  const poster = posterPaths.find(Boolean);
  const subtitle = progress && progress.total > 0
    ? `${progress.seen} of ${progress.total} seen`
    : `${filmCount} ${filmCount === 1 ? "film" : "films"}`;

  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      overflow="hidden"
      bg="bg.muted"
      borderBottom="1px solid"
      borderColor="whiteAlpha.200"
      shadow="lg"
      transform={visible ? "translateY(0)" : "translateY(-110%)"}
      opacity={visible ? 1 : 0}
      transition="transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s"
      pointerEvents={visible ? "auto" : "none"}
      aria-hidden={!visible}
    >
      {backdropPath && (
        <Box
          position="absolute"
          inset={0}
          bgImage={`url(https://image.tmdb.org/t/p/w780${backdropPath})`}
          bgSize="cover"
          bgPos="center 30%"
          filter="grayscale(70%)"
          opacity={0.5}
        />
      )}
      <Box position="absolute" inset={0} bgGradient="to-r" gradientFrom="bg.muted/90" gradientVia="bg.muted/60" gradientTo="bg.muted/30" />
      <Box position="absolute" left={0} top={0} bottom={0} width="3px" bg="orange.400" />

      <Flex position="relative" align="center" gap={3} px={4} py={2}>
        {poster && (
          <Image
            src={`https://image.tmdb.org/t/p/w92${poster}`}
            alt=""
            width="32px"
            aspectRatio={2 / 3}
            objectFit="cover"
            rounded="sm"
            outline="1px solid"
            outlineColor="whiteAlpha.300"
            flexShrink={0}
          />
        )}
        <Box minW={0} flex={1}>
          <Text fontSize="2xs" textTransform="uppercase" letterSpacing="0.25em" color="orange.400">
            {eyebrow}
          </Text>
          <Text fontWeight="semibold" letterSpacing="0.04em" truncate>
            {title}
            <Text as="span" fontWeight="normal" fontSize="xs" color="fg.muted" ml={2}>
              {subtitle}
            </Text>
          </Text>
        </Box>
        <HStack gap={2} flexShrink={0}>{actions}</HStack>
      </Flex>
    </Box>
  );
}
