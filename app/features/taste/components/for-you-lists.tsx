import { Box, Flex, Skeleton, VStack } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { LuArrowRight } from "react-icons/lu";
import { EmblaCarousel } from "~/components/emblaCarousel";
import { PageSection } from "~/components/layout/page-section";
import MoviePoster from "~/components/movie/previews/poster";
import type { CollectionWithMovies } from "~/features/collections";

/** One poster row per "For you" list, each linking to the full collection */
export function ForYouListRows({ lists }: { lists: CollectionWithMovies[] }) {
  return (
    <>
      {lists.map((list) => (
        <PageSection
          key={list.id}
          eyebrow="Made for you"
          title={list.name}
          subtitle={list.description ?? undefined}
          action={
            <Link to={`/collections/${list.id}`}>
              <Flex align="center" gap={1} fontSize="sm" color="orange.400" _hover={{ color: "orange.300" }}>
                View list <LuArrowRight />
              </Flex>
            </Link>
          }
        >
          <Box mx={-2}>
            <EmblaCarousel flex="0 0 160px">
              {list.collection_items.map((item) => item.movie && <MoviePoster key={item.movie_id} item={item.movie} />)}
            </EmblaCarousel>
          </Box>
        </PageSection>
      ))}
    </>
  );
}

/** Placeholder while lists are being made for the first time */
export function ForYouListsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <VStack align="stretch" gap={12}>
      {Array.from({ length: rows }, (_, row) => (
        <Box key={row}>
          <Skeleton height="3" width="80px" mb={2} />
          <Skeleton height="7" width="260px" mb={5} />
          <Flex gap={4} overflow="hidden">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} flex="0 0 144px" aspectRatio={2 / 3} rounded="md" />
            ))}
          </Flex>
        </Box>
      ))}
    </VStack>
  );
}
