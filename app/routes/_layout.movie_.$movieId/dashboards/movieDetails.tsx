import { Box, Badge } from "@chakra-ui/react"
import { Link } from "@remix-run/react";
import BackButton from "~/components/backButton";
import { EmblaCarousel } from "~/components/emblaCarousel";
import CreditProfile from "~/components/movie/credit-profile";
import MoviePoster from "~/components/movie/poster";
import Review from "~/components/movie/review";
import { KeywordsInterface } from "~/interfaces/keywords";
import { MovieListsInterface } from "~/interfaces/movie-lists";
import { PeopleListInterface } from "~/interfaces/people";
import { WatchProvidersByProductionInterface } from "~/interfaces/provider";
import { ReviewListsInterface } from "~/interfaces/review";
import { TmdbMovieDetailInterface } from "~/interfaces/tdmi-movie-detail";
import { VideosInterface } from "~/interfaces/videos";
import { slugify } from "~/utils/helpers";
import { Section } from "~/components/layout/section";
import MovieHero from "~/components/movie/movieHero";
import { YouTubeEmbed } from "~/components/media/youtube";

interface MovieDetailsProps {
  movieData: {
    details: TmdbMovieDetailInterface;
    similar: MovieListsInterface;
    reviews: ReviewListsInterface;
    keywords: KeywordsInterface;
    providers: WatchProvidersByProductionInterface;
    videos: VideosInterface;
    credits: PeopleListInterface;
  };
}

export default function MovieDetails({ movieData }: MovieDetailsProps) {
  return (
    <Box position="relative" flex={1} height="100%" ml="-16px" mr="-16px" mt="-16px" mb="-16px">
      <Box position="relative" width="100%" height="100%">
        <Box position="absolute" top={5} left={5} zIndex={1}>
          <BackButton />
        </Box>
        <MovieHero movie={movieData.details} height="600px" />
      </Box>
      <Box as="section" display="grid" gap={12} gridColumn={1} flex="1" overflow="hidden" pt={12} px={8} bg="blackAlpha.700" >
        <Section title="Keywords">
            <Box as="section" display="flex" gap={2} mt={4} flexWrap="wrap">
            {
              movieData.keywords.keywords.map((item, index) => (
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
                movieData.similar.results.map((item, i) => (
                  <MoviePoster key={i} item={item}/>
                ))
              }
          </EmblaCarousel>
        </Section>
        <Section title="Cast">
            <EmblaCarousel flex="0 0 130px">
              {
                movieData.credits.cast.map((item, index) => (
                  <Link key={index} to={`/credit/${slugify(item.name)}_${item.id}`}>
                    <CreditProfile item={item} role={item.character}/>
                  </Link>
                ))
              }
            </EmblaCarousel>
        </Section>
        <Section title="Crew">
          <EmblaCarousel flex="0 0 130px">
              {
                movieData.credits.crew.filter((i) => i.job === 'Original Music Composer' || i.job === 'Director' || i.job === 'Writer').map((item, index) => (
                  <Link key={index} to={`/credit/${slugify(item.name)}_${item.id}`}>
                    <CreditProfile item={item} role={item.job}/>
                  </Link>
                ))
              }
          </EmblaCarousel>
        </Section>
        <Section title="Videos">
          <EmblaCarousel flex="0 0 400px">
              {
                movieData.videos.results.map((item, i) => (
                  
                  item.site === 'YouTube' && <YouTubeEmbed key={i} url={item.key}/>
                ))
              }
          </EmblaCarousel>
        </Section>
        {
          movieData.reviews.results.length && (
            <Section title="Reviews">
                <EmblaCarousel flex="0 0 400px">
                  {
                    movieData.reviews.results.map((item, i) => (
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