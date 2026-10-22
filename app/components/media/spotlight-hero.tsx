import { AbsoluteCenter, Box, Button, Flex, Heading, HStack, Image, ProgressCircle, Text } from "@chakra-ui/react";
import { useEffect, useState, type ReactNode } from "react";
import MediaTriggerWrapper from "~/components/media/media-trigger-wrapper";
import WatchListDropdown from "~/components/user-actions/watchlist/dropdown";
import { usePosterGradientColor } from "~/hooks/use-poster-gradient-color";
import { TmdbMovieSummaryInterface } from "~/interfaces/tmdb/movie/summary";
import { formatReadableNumber } from "~/utils/helpers";

const ROTATE_EVERY_MS = 7000;

function ratingPalette(voteAverage: number) {
  if (voteAverage < 4) return "red";
  if (voteAverage < 6) return "orange";
  if (voteAverage < 7.5) return "yellow";
  return "green";
}

interface SpotlightHeroProps {
  movie: TmdbMovieSummaryInterface;
  /** Small label above the title, e.g. "Top result" */
  eyebrow: string;
  /** Room to leave at the bottom, e.g. for slide dots */
  pb?: number;
}

/** Full-width feature for one film: tinted backdrop, poster, title, rating, overview and actions */
export function SpotlightHero({ movie, eyebrow, pb = 8 }: SpotlightHeroProps) {
  const tint = usePosterGradientColor(movie.id, movie.poster_path, movie.id.toString());
  const voteAverage = Number(movie.vote_average) || 0;
  const year = movie.release_date?.split("-")[0];
  const trigger = (children: ReactNode) => (
    <MediaTriggerWrapper media={{ type: "movie", data: movie }} variant={movie.media_type === "tv" ? "link" : "info-panel"}>
      {children}
    </MediaTriggerWrapper>
  );

  return (
    <Box position="relative" overflow="hidden" bg="bg.muted" height="100%">
      {movie.backdrop_path && (
        <Box
          position="absolute"
          inset={0}
          bgImage={`url(https://image.tmdb.org/t/p/w1280${movie.backdrop_path})`}
          bgSize="cover"
          bgPos="center 25%"
          opacity={0.55}
        />
      )}
      <Box position="absolute" inset={0} bgGradient="to-br" gradientFrom={tint} gradientTo="transparent" opacity={0.7} />
      <Box position="absolute" inset={0} bgGradient="to-t" gradientFrom="bg.muted" gradientVia="bg.muted/50" gradientTo="transparent" />
      <Box position="absolute" inset={0} bgGradient="to-r" gradientFrom="bg.muted/80" gradientTo="transparent" />

      <Flex position="relative" height="100%" gap={{ base: 5, md: 8 }} px={{ base: 4, md: 8 }} pt={{ base: 8, md: 16 }} pb={pb} align="flex-end">
        {movie.poster_path && trigger(
          <Image
            src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
            alt={movie.title}
            width={{ base: "96px", md: "170px" }}
            aspectRatio={2 / 3}
            objectFit="cover"
            rounded="md"
            outline="1px solid"
            outlineColor="whiteAlpha.300"
            shadow="0 16px 40px rgba(0,0,0,0.6)"
            cursor="pointer"
            transition="transform 0.3s"
            _hover={{ transform: "translateY(-4px)" }}
            flexShrink={0}
          />
        )}
        <Box flex={1} minW={0}>
          <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="0.3em" color="orange.400" mb={2}>
            {eyebrow}
          </Text>
          <Heading
            as="h2"
            fontSize={{ base: "3xl", md: "6xl" }}
            lineHeight="1.05"
            fontWeight="light"
            letterSpacing="0.06em"
            textShadow="0 2px 12px rgba(0,0,0,0.6)"
            lineClamp={2}
          >
            {movie.title}
          </Heading>
          <HStack mt={3} gap={3} color="fg.muted" fontSize="sm" wrap="wrap">
            {year && <Text>{year}</Text>}
            {voteAverage > 0 && (
              <HStack gap={2}>
                <ProgressCircle.Root size="sm" value={voteAverage * 10} colorPalette={ratingPalette(voteAverage)}>
                  <ProgressCircle.Circle>
                    <ProgressCircle.Track />
                    <ProgressCircle.Range />
                  </ProgressCircle.Circle>
                  <AbsoluteCenter>
                    <Text fontSize="2xs" fontWeight="semibold" color="fg">{Math.round(voteAverage * 10)}</Text>
                  </AbsoluteCenter>
                </ProgressCircle.Root>
                <Text>{formatReadableNumber(Number(movie.vote_count) || 0)} ratings</Text>
              </HStack>
            )}
          </HStack>
          {movie.overview && (
            <Text mt={4} color="whiteAlpha.800" maxW="65ch" lineClamp={3} display={{ base: "none", sm: "-webkit-box" }}>
              {movie.overview}
            </Text>
          )}
          <HStack mt={5} gap={3}>
            {trigger(<Button size="sm" colorPalette="orange">View details</Button>)}
            <WatchListDropdown movieId={movie.id} />
          </HStack>
        </Box>
      </Flex>
    </Box>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/**
 * Cycles through a few films with a crossfade. Pauses while hovered or
 * focused, and doesn't auto-advance for people who prefer reduced motion.
 */
export function RotatingSpotlight({ movies, eyebrow }: { movies: TmdbMovieSummaryInterface[]; eyebrow: string }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (paused || reducedMotion || movies.length < 2) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % movies.length), ROTATE_EVERY_MS);
    return () => clearInterval(timer);
  }, [paused, reducedMotion, movies.length]);

  if (movies.length === 0) return null;

  return (
    <Box
      as="section"
      aria-roledescription="carousel"
      aria-label={eyebrow}
      position="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Every slide shares one grid cell, so the tallest sets the height and they crossfade in place */}
      <Box display="grid">
        {movies.map((movie, i) => (
          <Box
            key={movie.id}
            gridArea="1 / 1"
            opacity={i === active ? 1 : 0}
            // visibility flips at the end of the fade, and keeps hidden slides out of the tab order
            visibility={i === active ? "visible" : "hidden"}
            transition="opacity 0.9s ease, visibility 0.9s"
            aria-hidden={i !== active}
          >
            <SpotlightHero movie={movie} eyebrow={`${eyebrow} · #${i + 1}`} pb={14} />
          </Box>
        ))}
      </Box>

      {movies.length > 1 && (
        <HStack position="absolute" bottom={5} left={{ base: 4, md: 8 }} gap={2}>
          {movies.map((movie, i) => (
            <Box
              as="button"
              key={movie.id}
              aria-label={`Show ${movie.title}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
              height="4px"
              width={i === active ? "32px" : "14px"}
              rounded="full"
              bg={i === active ? "orange.400" : "whiteAlpha.400"}
              transition="width 0.3s, background 0.3s"
              cursor="pointer"
              _hover={{ bg: i === active ? "orange.400" : "whiteAlpha.700" }}
            />
          ))}
        </HStack>
      )}
    </Box>
  );
}
