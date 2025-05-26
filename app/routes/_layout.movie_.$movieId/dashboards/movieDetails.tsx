import { Box, Heading, Text, Badge } from "@chakra-ui/react"
import { Link } from "@remix-run/react";
import BackButton from "~/components/backButton";
import { EmblaCarousel } from "~/components/emblaCarousel";
import MovieImage from "~/components/movie/movieImage";
import Cast from "~/components/movie/cast";
import Crew from "~/components/movie/crew";
import MoviePoster from "~/components/movie/poster";
import Review from "~/components/movie/review";
import { KeywordsInterface } from "~/interfaces/keywords";
import { MovieListsInterface } from "~/interfaces/movie-lists";
import { PeopleListInterface } from "~/interfaces/people";
import { WatchProvidersInterface } from "~/interfaces/provider";
import { ReviewListsInterface } from "~/interfaces/review";
import { TmdbMovieDetailInterface } from "~/interfaces/tdmi-movie-detail";
import { VideosInterface } from "~/interfaces/videos";
import { getFormattedDate, slugify } from "~/utils/helpers";
import { Section } from "~/components/layout/section";


export default function MovieDetails({ movieDetails, similar, reviews, keywords, providers, videos, credits }: { movieDetails: TmdbMovieDetailInterface, similar: MovieListsInterface, reviews: ReviewListsInterface, keywords: KeywordsInterface, providers: WatchProvidersInterface, videos: VideosInterface, credits: PeopleListInterface}) {
  console.log('providers', providers)
  console.log('videos', videos)
  return (
    <Box position="relative" flex={1} height="100%" ml="-16px" mr="-16px" mt="-16px" mb="-16px">
      <Box position="relative" width="100%" height="100%">
        <Box position="absolute" top={5} left={5} zIndex={1}>
          <BackButton />
        </Box>
        <MovieImage backdrop_path={movieDetails.backdrop_path} />
        <Box
          position="absolute"
          bottom="0"
          left="0"
          width="100%"
          bgGradient="to-t" gradientFrom="blackAlpha.800" gradientTo="transparent" gradientVia="blackAlpha.800"
          color="white"
          p={4}
          px={8}
        >
          {/* Text and Data */}
          <Box display="flex" gap={4} alignItems="end">
            <Heading as="h1" lineHeight={1} letterSpacing="0.225rem" size="4xl" fontFamily="'Epilogue', sans-serif" fontWeight={400}>{movieDetails.title}</Heading><small>{movieDetails.runtime} mins</small>
          </Box>
          <Text mt={4}>{movieDetails.overview}</Text>
          <Text mt={4}>Released { getFormattedDate({release_date: movieDetails.release_date, options: {year: 'numeric', month: 'long',day: 'numeric'}, region:'en-US'}) }</Text>
          
          <Box display="flex" gap={2} mt={4}>
              {
                movieDetails.genres.map((item, index) => (
                  <Link to={`/genre/${item.name.toLowerCase()}`} key={index}>
                    <Badge size="md" colorPalette="orange"> {item.name} </Badge>
                  </Link>
                ))
              }
          </Box>

        </Box>
      </Box>
      <Box as="section" display="grid" gap={12} gridColumn={1} flex="1" overflow="hidden" pt={12} px={8} bg="blackAlpha.700" >
        <Section title="Keywords">
            <Box as="section" display="flex" gap={2} mt={4} flexWrap="wrap">
            {
              keywords.keywords.map((item, index) => (
                <Link to={`/tag/${slugify(item.name)}?id=${item.id}`} key={index}>
                  <Badge size="md" colorPalette="red"> {item.name} </Badge>
                </Link>
              ))
            }
          </Box>
        </Section>
        <Section title="Similar movies">
          <EmblaCarousel>
              {
                similar.results.map((item, i) => (
                  <MoviePoster key={i} item={item}/>
                ))
              }
          </EmblaCarousel>
        </Section>
        <Section title="Cast">
            <EmblaCarousel flex="0 0 130px">
              {
                credits.cast.map((item, index) => (
                  <Link key={index} to={`/credit/${slugify(item.name)}_${item.cast_id}`}>
                    <Cast item={item}/>
                  </Link>
                ))
              }
            </EmblaCarousel>
        </Section>
        <Section title="Crew">
          <EmblaCarousel flex="0 0 130px">
              {
                credits.crew.filter((i) => i.job === 'Original Music Composer' || i.job === 'Director' || i.job === 'Writer').map((item, i) => (
                  <Crew key={i} item={item}/>
                ))
              }
          </EmblaCarousel>
        </Section>
        {
          reviews.results.length && (
            <Section title="Reviews">
                <EmblaCarousel flex="0 0 400px">
                  {
                    reviews.results.map((item, i) => (
                      <Review key={i} item={item}/>
                    ))
                  }
                </EmblaCarousel>
            </Section>
          )
        }
      </Box>
    </Box>
  );
}