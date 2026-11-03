import { Box, Flex, Skeleton, Text } from "@chakra-ui/react";
import { EmblaCarousel } from "~/components/emblaCarousel";
import { Section } from "~/components/layout/section";
import MoviePoster from "~/components/movie/previews/poster";
import { InlineError } from "~/shared/ui/inline-error";
import { useSimilarStories } from "../queries";

interface SimilarStoriesProps {
  movieId: number;
}

/** Films with a similar story shape and feel, with the themes and moods they share */
export default function SimilarStories({ movieId }: SimilarStoriesProps) {
  const { data, isPending, isError, error, refetch } = useSimilarStories(movieId);

  return (
    <Section title="Similar stories">
      {isPending ? (
        <Flex gap={4} overflow="hidden">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} flex="0 0 144px" aspectRatio={2 / 3} rounded="md" />
          ))}
        </Flex>
      ) : isError ? (
        <InlineError fallback="Couldn't load similar stories." error={error} onRetry={() => refetch()} />
      ) : !data.ready || data.films.length === 0 ? (
        <Text fontSize="sm" color="fg.muted">
          Story matches aren&apos;t ready for this film yet.
        </Text>
      ) : (
        <>
          {data.logline && (
            <Text fontSize="sm" color="fg.muted" mb={4} maxW="2xl">
              {data.logline}
            </Text>
          )}
          <EmblaCarousel>
            {data.films.map((film) => (
              <Box key={film.movie.id}>
                <MoviePoster item={film.movie} />
                <Text fontSize="xs" color="orange.300" lineClamp={1} title={[...film.sharedThemes, ...film.sharedMoods].join(", ")}>
                  {[...film.sharedThemes, ...film.sharedMoods].slice(0, 2).join(" · ")}
                </Text>
              </Box>
            ))}
          </EmblaCarousel>
        </>
      )}
    </Section>
  );
}
