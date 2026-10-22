import { AbsoluteCenter, Box, CloseButton, Flex, Image, ProgressCircle, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { GenreInterface } from "~/interfaces/tmdb/genre";

interface InfoPanelStickyBarProps {
  title: string;
  /** Release or first-air date (YYYY-MM-DD) */
  date?: string;
  genres?: GenreInterface[];
  /** TMDB vote average, 0-10 */
  voteAverage?: number;
  posterPath?: string | null;
  backdropPath?: string | null;
  onClose: () => void;
  visible: boolean;
}

function ratingPalette(voteAverage: number) {
  if (voteAverage < 4) return "red";
  if (voteAverage < 6) return "orange";
  if (voteAverage < 7.5) return "yellow";
  return "green";
}

/**
 * Tracks whether an element has scrolled up out of view, inside whichever
 * container is scrolling (the desktop panel or the mobile drawer). Put the
 * sentinel ref after the content the sticky bar summarises.
 */
export function useScrolledPast() {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => {
      // Leaving view at the bottom (e.g. on a short screen) doesn't count, only above the bar's anchor
      const anchorTop = anchorRef.current?.getBoundingClientRect().top ?? 0;
      setScrolledPast(!entry.isIntersecting && entry.boundingClientRect.top < anchorTop);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return { sentinelRef, anchorRef, scrolledPast };
}

/**
 * Compact summary that slides in at the top of an info panel once its main
 * header has scrolled away. Takes no space in the layout: place it as the
 * first child of the panel and pass `anchorRef` from `useScrolledPast`.
 */
export const InfoPanelStickyBar = ({
  anchorRef,
  ...props
}: InfoPanelStickyBarProps & { anchorRef: React.RefObject<HTMLDivElement> }) => (
  <Box ref={anchorRef} position="sticky" top={0} height={0} zIndex="sticky">
    <StickyBarContent {...props} />
  </Box>
);

function StickyBarContent({ title, date, genres = [], voteAverage, posterPath, backdropPath, onClose, visible }: InfoPanelStickyBarProps) {
  const year = date?.split("-")[0];
  const subtitle = [year, ...genres.slice(0, 3).map((genre) => genre.name)].filter(Boolean).join(" · ");

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
          opacity={0.55}
        />
      )}
      <Box position="absolute" inset={0} bgGradient="to-r" gradientFrom="bg.muted/90" gradientVia="bg.muted/60" gradientTo="bg.muted/30" />
      <Box position="absolute" left={0} top={0} bottom={0} width="3px" bg="orange.400" />

      <Flex position="relative" align="center" gap={3} px={4} py={2}>
        {posterPath && (
          <Image
            src={`https://image.tmdb.org/t/p/w92${posterPath}`}
            alt=""
            width="36px"
            aspectRatio={2 / 3}
            objectFit="cover"
            rounded="sm"
            outline="1px solid"
            outlineColor="whiteAlpha.300"
            flexShrink={0}
          />
        )}
        <Box minW={0} flex={1}>
          <Text fontWeight="semibold" letterSpacing="0.04em" truncate textShadow="0 1px 6px rgba(0,0,0,0.6)">
            {title}
          </Text>
          {subtitle && (
            <Text fontSize="xs" color="fg.muted" truncate>
              {subtitle}
            </Text>
          )}
        </Box>
        {voteAverage !== undefined && voteAverage > 0 && (
          <ProgressCircle.Root size="sm" value={voteAverage * 10} colorPalette={ratingPalette(voteAverage)} flexShrink={0}>
            <ProgressCircle.Circle>
              <ProgressCircle.Track />
              <ProgressCircle.Range />
            </ProgressCircle.Circle>
            <AbsoluteCenter>
              <Text fontSize="2xs" fontWeight="semibold">{Math.round(voteAverage * 10)}</Text>
            </AbsoluteCenter>
          </ProgressCircle.Root>
        )}
        <CloseButton size="sm" variant="subtle" onClick={onClose} aria-label="Close panel" flexShrink={0} />
      </Flex>
    </Box>
  );
}
