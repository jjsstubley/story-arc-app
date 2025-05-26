import { Box, Heading, Text } from "@chakra-ui/react"
import BackButton from "~/components/backButton";
import { EmblaCarousel } from "~/components/emblaCarousel";
import MovieImage from "~/components/movie/movieImage";
import MoviePoster from "~/components/movie/poster";

import { PersonDetailsInterface } from "~/interfaces/people";

import { ImagesInterface } from "~/interfaces/images";
import { CreditListInterface } from "~/interfaces/credit";


export default function PersonDetails({ personDetails, images, allCredits }: { personDetails: PersonDetailsInterface, images: ImagesInterface, allCredits: CreditListInterface}) {
  console.log('images', images)
  return (
    <Box position="relative" flex={1} height="100%">
      <Box position="relative" width="100%" height="100%">
        <Box position="absolute" top={5} left={5} zIndex={1}>
          <BackButton />
        </Box>
        <MovieImage backdrop_path={personDetails.profile_path} />
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
            <Heading as="h1" lineHeight={1} letterSpacing="0.225rem" size="4xl" fontFamily="'Epilogue', sans-serif" fontWeight={400}>{personDetails.name}</Heading><small>{personDetails.also_known_as[0]}</small>
          </Box>
          <Text mt={4} lineClamp="3">{personDetails.biography}</Text>
          <Text mt={4}>DOB: {personDetails.birthday}</Text>
          
          {/* <Box display="flex" gap={2} mt={4}>
              {
                movieDetails.genres.map((item, index) => (
                  <Link to={`/genre/${item.name.toLowerCase()}`} key={index}>
                    <Badge size="md" colorPalette="orange"> {item.name} </Badge>
                  </Link>
                ))
              }
          </Box> */}

        </Box>
      </Box>
      <Box as="section" display="grid" gap={12} gridColumn={1} flex="1" overflow="hidden" mt={12} mx={8}>
        <Box as="section" flex="1" overflow="hidden">
            <Heading as="h3" pb={4}>Starred in</Heading>
            <EmblaCarousel>
              {
                allCredits.cast.map((item, i) => (
                  <MoviePoster key={i} item={item}/>
                ))
              }
            </EmblaCarousel>
        </Box> 

        <Box as="section" flex="1" overflow="hidden">
            <Heading as="h3" pb={4}>Credit in</Heading>
            <EmblaCarousel>
              {
                allCredits.cast.map((item, i) => (
                  <MoviePoster key={i} item={item}/>
                ))
              }
            </EmblaCarousel>
        </Box> 

      </Box>
    </Box>
  );
}