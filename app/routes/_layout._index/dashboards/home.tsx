import { Box, Flex, Text } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { LuArrowRight } from "react-icons/lu";
import CreditAvatar from "~/components/credit/credit-avatar";
import { EmblaCarousel } from "~/components/emblaCarousel";
import { PageSection } from "~/components/layout/page-section";
import { RotatingSpotlight } from "~/components/media/spotlight-hero";
import FeatureMovie from "~/components/movie/previews/feature";
import MovieFeaturette from "~/components/movie/previews/featurette";
import MoviePoster from "~/components/movie/previews/poster";
import TVSeriesPoster from "~/components/tv/series/previews/poster";
import type { CollectionWithMovies } from "~/features/collections";
import { MovieListsInterface } from "~/interfaces/tmdb/movie-lists";
import { TmdbMovieSummaryInterface } from "~/interfaces/tmdb/movie/summary";
import { PersonSummaryForInterface } from "~/interfaces/tmdb/people/summary";
import { TrendingMoviesInterface, TrendingPeopleInterface, TrendingTVSeriesListsInterface } from "~/interfaces/tmdb/trending";
import { TmdbTVSeriesSummaryInterface } from "~/interfaces/tmdb/tv/series/summary";

const SPOTLIGHT_COUNT = 5;
const RANKED_COUNT = 10;

interface HomeDashboardProps {
  movieLists: [MovieListsInterface, MovieListsInterface, MovieListsInterface, TrendingMoviesInterface, TrendingTVSeriesListsInterface];
  trendingPeople: TrendingPeopleInterface;
  collections: CollectionWithMovies[];
}

export default function HomeDashboard({ movieLists, trendingPeople, collections }: HomeDashboardProps) {
  const [popular, nowPlaying, topRated, trendingMovies, trendingTv] = movieLists;
  const popularMovies = popular.results as TmdbMovieSummaryInterface[];

  return (
    <Box>
      <RotatingSpotlight movies={popularMovies.slice(0, SPOTLIGHT_COUNT)} eyebrow="Popular now" />

      <Flex direction="column" gap={14} px={{ base: 4, md: 8 }} py={10}>
        <PageSection eyebrow="Today" title="Top 10 movies" subtitle="What everyone is watching right now">
          <Row flex="0 0 auto">
            {(trendingMovies.results as TmdbMovieSummaryInterface[]).slice(0, RANKED_COUNT).map((movie, i) => (
              <RankedPoster key={movie.id} rank={i + 1} movie={movie} />
            ))}
          </Row>
        </PageSection>

        <PageSection eyebrow="Television" title="Trending shows">
          <Row flex="0 0 170px">
            {(trendingTv.results as TmdbTVSeriesSummaryInterface[]).map((show) => (
              <TVSeriesPoster key={show.id} item={show} />
            ))}
          </Row>
        </PageSection>

        <PageSection eyebrow="In cinemas" title="Now playing">
          <Row flex="0 0 300px">
            {(nowPlaying.results as TmdbMovieSummaryInterface[]).map((movie) => (
              <MovieFeaturette key={movie.id} item={movie} />
            ))}
          </Row>
        </PageSection>

        <PageSection eyebrow="People" title="Trending stars">
          <Row flex="0 0 140px">
            {(trendingPeople.results as PersonSummaryForInterface[]).map((person) => (
              <CreditAvatar key={person.id} item={person} />
            ))}
          </Row>
        </PageSection>

        {popularMovies.length > SPOTLIGHT_COUNT && (
          <PageSection eyebrow="Popular" title="More popular films">
            <Row flex="0 0 170px">
              {popularMovies.slice(SPOTLIGHT_COUNT).map((movie) => (
                <MoviePoster key={movie.id} item={movie} />
              ))}
            </Row>
          </PageSection>
        )}

        <PageSection eyebrow="Critics' picks" title="Top rated films">
          <Row flex="0 0 33.33%" minW="320px" options={{ dragFree: false, slidesToScroll: 2, skipSnaps: true }}>
            {(topRated.results as TmdbMovieSummaryInterface[]).map((movie) => (
              <FeatureMovie key={movie.id} movie={movie} displayPopularity={false} />
            ))}
          </Row>
        </PageSection>

        {collections.map((collection) => (
          <PageSection
            key={collection.id}
            eyebrow="Curated collection"
            title={collection.name}
            subtitle={collection.description ?? undefined}
            action={
              <Link to={`/collections/${collection.id}`}>
                <Flex align="center" gap={1} fontSize="sm" color="orange.400" _hover={{ color: "orange.300" }}>
                  View collection <LuArrowRight />
                </Flex>
              </Link>
            }
          >
            <Row flex="0 0 170px">
              {collection.collection_items
                .map((item) => item.movie && <MoviePoster key={item.movie_id} item={item.movie} />)}
            </Row>
          </PageSection>
        ))}
      </Flex>
    </Box>
  );
}

/** A carousel that bleeds into the section's side padding so slide padding lines up with the heading */
function Row({ children, ...carousel }: React.ComponentProps<typeof EmblaCarousel>) {
  return (
    <Box mx={-2}>
      <EmblaCarousel {...carousel}>{children}</EmblaCarousel>
    </Box>
  );
}

/** Poster with a large outlined rank number tucked behind its left edge */
function RankedPoster({ rank, movie }: { rank: number; movie: TmdbMovieSummaryInterface }) {
  return (
    <Flex align="flex-end">
      <Text
        aria-hidden
        // Fixed width so every card is the same size whatever the digits
        width={{ base: "52px", md: "68px" }}
        textAlign="right"
        fontSize={{ base: "7xl", md: "8xl" }}
        fontWeight="black"
        lineHeight="0.8"
        color="transparent"
        letterSpacing="-0.06em"
        css={{ WebkitTextStroke: "2px var(--chakra-colors-white-alpha-500)" }}
        mr={-4}
        mb={7}
        userSelect="none"
        flexShrink={0}
      >
        {rank}
      </Text>
      <Box position="relative" width={{ base: "120px", md: "150px" }}>
        <MoviePoster item={movie} />
      </Box>
    </Flex>
  );
}
