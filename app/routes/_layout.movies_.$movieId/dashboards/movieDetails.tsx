import { Box, Badge } from "@chakra-ui/react"
import { Link } from "@remix-run/react";
import BackButton from "~/components/backButton";
import { EmblaCarousel } from "~/components/emblaCarousel";
import CreditProfile from "~/components/credit/credit-profile";
import MoviePoster from "~/components/movie/previews/poster";
import Review from "~/components/movie/review";

import { slugify } from "~/utils/helpers";
import { Section } from "~/components/layout/section";
import MovieHero from "~/components/movie/hero";
import { YouTubeEmbed } from "~/components/embeds/youtube";
import { TmdbMovieDetailWAppendsProps } from "~/interfaces/tmdb/movie/detail";

interface MovieDetailsProps {
  movieData: {
    details: TmdbMovieDetailWAppendsProps;
  };
}

export default function MovieDetails({ movieData }: MovieDetailsProps) {
  return (
    <Box position="relative" flex={1} p={4}  ml="-16px" mr="-16px" mt="-16px" mb="-16px" overflow="auto" height="calc(100vh - 100px)">
      <Box position="relative" width="100%" height="100%">
        <Box position="absolute" top={5} left={5} zIndex={1}>
          <BackButton />
        </Box>
        <MovieHero movie={movieData.details} height="600px" />
      </Box>
      <Box as="section" display="grid" gap={12} gridColumn={1} flex="1" overflow="hidden" pt={12} px={8} >
        <Section title="Keywords">
            <Box as="section" display="flex" gap={2} mt={4} flexWrap="wrap">
            {
              movieData.details.keywords?.keywords?.map((item, index) => (
                <Link to={`/tags/${slugify(item.name)}?id=${item.id}`} key={index}>
                  <Badge size="md" colorPalette="red"> {item.name} </Badge>
                </Link>
              ))
            }
          </Box>
        </Section>
        <Section title="Similar movies">
          <EmblaCarousel>
              {
                movieData.details.similar?.results.map((item, i) => (
                  <MoviePoster key={i} item={item}/>
                ))
              }
          </EmblaCarousel>
        </Section>
        <Section title="Cast">
            <EmblaCarousel flex="0 0 130px">
              {
                movieData.details.credits?.cast.map((item, index) => (
                  <Link key={index} to={`/credits/${slugify(item.name)}_${item.id}`}>
                    <CreditProfile item={item} role={item.character}/>
                  </Link>
                ))
              }
            </EmblaCarousel>
        </Section>
        <Section title="Crew">
          <EmblaCarousel flex="0 0 130px">
              {
                movieData.details.credits?.crew.filter((i) => i.job === 'Original Music Composer' || i.job === 'Director' || i.job === 'Writer').map((item, index) => (
                  <Link key={index} to={`/credits/${slugify(item.name)}_${item.id}`}>
                    <CreditProfile item={item} role={item.job}/>
                  </Link>
                ))
              }
          </EmblaCarousel>
        </Section>
        <Section title="Videos">
          <EmblaCarousel flex="0 0 400px">
              {
                movieData.details.videos?.results.map((item, i) => (
                  
                  item.site === 'YouTube' && <YouTubeEmbed key={i} url={item.key}/>
                ))
              }
          </EmblaCarousel>
        </Section>
        {
          movieData.details.reviews?.results.length && (
            <Section title="Reviews">
                <EmblaCarousel flex="0 0 400px">
                  {
                    movieData.details.reviews?.results.map((item, i) => (
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