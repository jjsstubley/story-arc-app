import { AbsoluteCenter, Badge, Box, Button, Flex, Heading, HStack, Image, ProgressCircle, SimpleGrid, Text, Wrap } from "@chakra-ui/react"
import { Link } from "@remix-run/react";
import { useState, type ReactNode } from "react";
import { BsBuilding } from "react-icons/bs";
import CreditAvatar from "~/components/credit/credit-avatar";
import { EmblaCarousel } from "~/components/emblaCarousel";
import MediaTriggerWrapper from "~/components/media/media-trigger-wrapper";
import MoviePoster from "~/components/movie/previews/poster";
import WatchListDropdown from "~/components/user-actions/watchlist/dropdown";
import { usePosterGradientColor } from "~/hooks/use-poster-gradient-color";
import { KeywordsPaginationInterface } from "~/interfaces/tmdb/keywords";
import { TmdbCollectionsInterface, TmdbCollectionsPaginationInterface } from "~/interfaces/tmdb/tmdb-collections";
import { CompanyInterface, CompanyPaginationInterface } from "~/interfaces/tmdb/company";
import { TmdbMoviePaginationInterface, TmdbMovieSummaryInterface } from "~/interfaces/tmdb/movie/summary";
import { TrendingPeopleInterface } from "~/interfaces/tmdb/trending";
import { PersonSummaryForInterface } from "~/interfaces/tmdb/people/summary";
import { formatReadableNumber, getSubtleBackgroundColor, slugify } from "~/utils/helpers";

/** Leaves room for the sticky bar when jumping to a section */
const SECTION_SCROLL_MARGIN = "88px";
const VISIBLE_COMPANIES = 10;

interface SearchOverviewProps {
  movies: TmdbMoviePaginationInterface;
  keywords: KeywordsPaginationInterface;
  people: TrendingPeopleInterface;
  collections: TmdbCollectionsPaginationInterface;
  companies: CompanyPaginationInterface;
  query: string;
}

export default function SearchOverview({ movies, keywords, people, collections, companies, query }: SearchOverviewProps) {
  const byPopularity = <T extends { popularity: number }>(items: T[]) => [...items].sort((a, b) => b.popularity - a.popularity);
  const [topResult, ...moreMovies] = byPopularity(movies.results as TmdbMovieSummaryInterface[]);
  const sortedPeople = byPopularity(people.results as PersonSummaryForInterface[]);

  const sections = [
    { id: "matches", label: "Movies", count: moreMovies.length },
    { id: "people", label: "People", count: sortedPeople.length },
    { id: "collections", label: "Collections", count: collections.results.length },
    { id: "companies", label: "Companies", count: companies.results.length },
    { id: "keywords", label: "Keywords", count: keywords.results.length },
  ].filter((section) => section.count > 0);

  return (
    <Box position="relative">
      <SearchBar query={query} sections={sections} />

      {topResult ? (
        <TopResultHero movie={topResult} />
      ) : (
        sections.length === 0 && (
          <Box px={8} py={20} textAlign="center">
            <Heading size="lg" fontWeight="light" mb={2}>No results for &ldquo;{query}&rdquo;</Heading>
            <Text color="fg.muted">Check the spelling, or try Browse to search by filters or description.</Text>
          </Box>
        )
      )}

      <Flex direction="column" gap={12} px={{ base: 4, md: 8 }} py={8}>
        {moreMovies.length > 0 && (
          <Section id="matches" title="More matches" subtitle="Other movies and shows" count={moreMovies.length}>
            <Box mx={-2}>
              <EmblaCarousel flex="0 0 150px">
                {moreMovies.map((movie) => (
                  <MoviePoster key={movie.id} item={movie} />
                ))}
              </EmblaCarousel>
            </Box>
          </Section>
        )}

        {sortedPeople.length > 0 && (
          <Section id="people" title="People" subtitle="Cast & crew" count={sortedPeople.length}>
            <Box mx={-2}>
              <EmblaCarousel flex="0 0 140px">
                {sortedPeople.map((person) => (
                  <CreditAvatar key={person.id} item={person} />
                ))}
              </EmblaCarousel>
            </Box>
          </Section>
        )}

        {collections.results.length > 0 && (
          <Section id="collections" title="Collections" subtitle="Film series" count={collections.results.length}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
              {collections.results.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </SimpleGrid>
          </Section>
        )}

        {companies.results.length > 0 && (
          <Section id="companies" title="Companies" subtitle="Production companies" count={companies.results.length}>
            <CompanyGrid companies={companies.results} />
          </Section>
        )}

        {keywords.results.length > 0 && (
          <Section id="keywords" title="Keywords" subtitle="Browse films by theme" count={keywords.results.length}>
            <Wrap gap={2}>
              {keywords.results.map((keyword) => (
                <Link key={keyword.id} to={`/tags/${slugify(keyword.name)}?id=${keyword.id}`}>
                  <Badge
                    variant="outline"
                    colorPalette="orange"
                    rounded="full"
                    px={3}
                    py={1}
                    size="md"
                    _hover={{ bg: "orange.900/40" }}
                    transition="background 0.2s"
                  >
                    {keyword.name}
                  </Badge>
                </Link>
              ))}
            </Wrap>
          </Section>
        )}
      </Flex>
    </Box>
  );
}

/** Sticky bar with the query and a jump link per section */
function SearchBar({ query, sections }: { query: string; sections: { id: string; label: string; count: number }[] }) {
  return (
    <Box
      position="sticky"
      top={0}
      zIndex="sticky"
      bg="bg.muted/90"
      backdropFilter="blur(12px)"
      borderBottom="1px solid"
      borderColor="whiteAlpha.200"
    >
      <Box position="absolute" left={0} top={0} bottom={0} width="3px" bg="orange.400" />
      <Flex align="center" gap={4} px={{ base: 4, md: 8 }} py={3} wrap={{ base: "wrap", md: "nowrap" }}>
        <Box minW={0} flexShrink={0}>
          <Text fontSize="2xs" textTransform="uppercase" letterSpacing="0.3em" color="orange.400">
            Search
          </Text>
          <Heading as="h1" fontSize="xl" fontWeight="light" letterSpacing="0.04em" truncate maxW={{ base: "100%", md: "320px" }}>
            &ldquo;{query}&rdquo;
          </Heading>
        </Box>
        {sections.length > 0 && (
          <HStack
            as="nav"
            aria-label="Jump to section"
            gap={2}
            ml={{ md: "auto" }}
            overflowX="auto"
            width={{ base: "100%", md: "auto" }}
            css={{ scrollbarWidth: "none" }}
          >
            {sections.map((section) => (
              <Button
                key={section.id}
                size="xs"
                variant="outline"
                borderColor="whiteAlpha.300"
                bg="blackAlpha.300"
                rounded="full"
                flexShrink={0}
                onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
              >
                {section.label}
                <Text as="span" color="orange.400" fontWeight="semibold">{section.count}</Text>
              </Button>
            ))}
          </HStack>
        )}
      </Flex>
    </Box>
  );
}

function ratingPalette(voteAverage: number) {
  if (voteAverage < 4) return "red";
  if (voteAverage < 6) return "orange";
  if (voteAverage < 7.5) return "yellow";
  return "green";
}

function TopResultHero({ movie }: { movie: TmdbMovieSummaryInterface }) {
  const tint = usePosterGradientColor(movie.id, movie.poster_path, movie.id.toString());
  const voteAverage = Number(movie.vote_average) || 0;
  const year = movie.release_date?.split("-")[0];
  const trigger = (children: ReactNode) => (
    <MediaTriggerWrapper media={{ type: "movie", data: movie }} variant={movie.media_type === "tv" ? "link" : "info-panel"}>
      {children}
    </MediaTriggerWrapper>
  );

  return (
    <Box position="relative" overflow="hidden" bg="bg.muted">
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

      <Flex position="relative" gap={{ base: 5, md: 8 }} px={{ base: 4, md: 8 }} pt={{ base: 8, md: 16 }} pb={8} align="flex-end">
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
            Top result
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

function Section({ id, title, subtitle, count, children }: { id: string; title: string; subtitle: string; count: number; children: ReactNode }) {
  return (
    <Box as="section" id={id} scrollMarginTop={SECTION_SCROLL_MARGIN} aria-labelledby={`${id}-heading`}>
      <Flex align="baseline" gap={3} mb={1}>
        <Heading id={`${id}-heading`} as="h3" fontSize="2xl" fontWeight="light" letterSpacing="0.06em">
          {title}
        </Heading>
        <Text fontSize="sm" color="orange.400" fontWeight="semibold">{count}</Text>
      </Flex>
      <Text fontSize="sm" color="fg.muted" mb={5}>{subtitle}</Text>
      {children}
    </Box>
  );
}

function CollectionCard({ collection }: { collection: TmdbCollectionsInterface }) {
  return (
    <MediaTriggerWrapper media={{ type: "collection", data: collection }}>
      <Box
        position="relative"
        height="150px"
        rounded="lg"
        overflow="hidden"
        cursor="pointer"
        bg="gray.900"
        border="1px solid"
        borderColor="whiteAlpha.200"
        className="group"
        transition="border-color 0.2s"
        _hover={{ borderColor: "orange.400" }}
      >
        {collection.backdrop_path && (
          <Image
            src={`https://image.tmdb.org/t/p/w780${collection.backdrop_path}`}
            alt=""
            position="absolute"
            inset={0}
            width="100%"
            height="100%"
            objectFit="cover"
            transition="transform 0.4s"
            _groupHover={{ transform: "scale(1.05)" }}
          />
        )}
        <Box position="absolute" inset={0} bgGradient="to-r" gradientFrom="blackAlpha.900" gradientVia="blackAlpha.600" gradientTo="transparent" />
        <Flex position="relative" height="100%" direction="column" justify="flex-end" p={4} maxW="75%">
          <Text fontSize="lg" fontWeight="semibold" letterSpacing="0.03em" lineClamp={1}>{collection.name}</Text>
          {collection.overview && (
            <Text fontSize="xs" color="whiteAlpha.700" lineClamp={2} mt={1}>{collection.overview}</Text>
          )}
        </Flex>
      </Box>
    </MediaTriggerWrapper>
  );
}

/** Companies with logos first; the long tail of logo-less matches is behind "Show all" */
function CompanyGrid({ companies }: { companies: CompanyInterface[] }) {
  const [showAll, setShowAll] = useState(false);
  const sorted = [...companies].sort((a, b) => Number(Boolean(b.logo_path)) - Number(Boolean(a.logo_path)));
  const visible = showAll ? sorted : sorted.slice(0, VISIBLE_COMPANIES);

  return (
    <>
      <SimpleGrid minChildWidth="150px" gap={4}>
        {visible.map((company) => (
          <CompanyTile key={company.id} company={company} />
        ))}
      </SimpleGrid>
      {companies.length > VISIBLE_COMPANIES && (
        <Button mt={4} size="sm" variant="ghost" colorPalette="orange" onClick={() => setShowAll(!showAll)}>
          {showAll ? "Show fewer" : `Show all ${companies.length}`}
        </Button>
      )}
    </>
  );
}

function CompanyTile({ company }: { company: CompanyInterface }) {
  return (
    <Box rounded="lg" border="1px solid" borderColor="whiteAlpha.200" overflow="hidden" bg="blackAlpha.300">
      <Flex
        height="84px"
        align="center"
        justify="center"
        p={4}
        // Most TMDB logos are dark on transparent, so give them a light backdrop
        bg={company.logo_path ? "whiteAlpha.900" : getSubtleBackgroundColor(company.id || company.name)}
      >
        {company.logo_path ? (
          <Image src={`https://image.tmdb.org/t/p/w185${company.logo_path}`} alt={company.name} maxH="100%" maxW="100%" objectFit="contain" />
        ) : (
          <BsBuilding size={28} opacity={0.6} />
        )}
      </Flex>
      <Box px={3} py={2}>
        <Text fontSize="sm" lineClamp={1}>{company.name}</Text>
        {company.origin_country && <Text fontSize="xs" color="fg.muted">{company.origin_country}</Text>}
      </Box>
    </Box>
  );
}
