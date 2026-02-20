import { Box, Text, HStack, Image, Flex } from "@chakra-ui/react";
import '~/styles.css'

import { TmdbMovieSummaryInterface } from "~/interfaces/tmdb/movie/summary";

import MoviePoster from "./poster";
import ArkHeader from "~/components/ui/ark-header";
import RatingCard from "../rating-card";
import { useEffect, useState } from "react";
import { TmdbMovieDetailWAppendsProps } from "~/interfaces/tmdb/movie/detail";
import { getFormattedDate } from "~/utils/helpers";
import WatchListDropdown from "~/components/user-actions/watchlist/dropdown";
import { usePosterGradientColor } from "~/hooks/use-poster-gradient-color";

import MediaTriggerWrapper from "~/components/media/media-trigger-wrapper";

const TopResult = ({movie, height = '300px', variant='info-panel'} : {movie: TmdbMovieSummaryInterface, height?: string, variant?: 'dialog' | 'info-panel' }) => {

  const [movieDetails, setMovieDetails] = useState<TmdbMovieDetailWAppendsProps | null>(null)
  const fetchMovieDetails = async () => {
      const movieDetails = await fetch(`/api/movie/${movie.id}`)
      const data = await movieDetails.json()
      setMovieDetails(data.movieDetails as TmdbMovieDetailWAppendsProps)
  }

  useEffect(() => {
    fetchMovieDetails()
  }, [])


  if (!movie) return (<Box width="100%" height={height} backgroundColor="gray.900" rounded="md"></Box>)
  
  const gradientColor = usePosterGradientColor(movie.id, movie.poster_path, movie.id.toString());
  
  const feature = (
    <Box position="relative" rounded="md" overflow="hidden">
      {/* Background image layer - subtle, centered */}
      {movie.backdrop_path && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={0}
          opacity={0.25}
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
        >
          <Image
            src={`https://image.tmdb.org/t/p/original/${movie.backdrop_path}`}
            width="100%"
            height="100%"
            objectFit="cover"
            objectPosition="center"
            filter="blur(10px) brightness(0.8)"
            transform="scale(1.1)"
          />
        </Box>
      )}

      {/* Gradient overlay */}
      <Box 
        position="relative"
        zIndex={1}
        backgroundColor="transparent" 
        bgGradient="to-b" 
        gradientFrom={gradientColor} 
        gradientTo="transparent" 
        p={4}
      >
        <Flex justifyContent="space-between" gap={4}>
          <Box minW="100px" maxW="200px" position="relative" zIndex={2}>
            <MoviePoster item={movie} includeTitle={false} />
          </Box>
          <Box
            color="white"
            display="flex"
            flex={1}
            pt={4}
            flexDirection="column"
            gap={4}
            position="relative"
            zIndex={2}
          >
            {/* Text and Data */}
            
            <Box display="flex" gap={4} alignItems="start" justifyContent="space-between">
              <Box flex={1}>
                <ArkHeader
                  fontSize="2xl"
                >
                  {movie.title}
                </ArkHeader>
                {movie.release_date && (
                  <Text mt={2} fontSize="sm" color="whiteAlpha.700">
                    Released {getFormattedDate({release_date: movie.release_date, options: {year: 'numeric', month: 'long', day: 'numeric'}, region:'en-US'})}
                  </Text>
                )}
              </Box>
              <Box onClick={(e) => e.stopPropagation()}>
                <WatchListDropdown movieId={movie.id} />
              </Box>
            </Box>

            {movie.overview && (
              <Text fontSize="sm" color="whiteAlpha.800" noOfLines={3}>
                {movie.overview}
              </Text>
            )}

            {movieDetails && <Box display="flex"><RatingCard movie={movieDetails} /></Box>}
          </Box>
        </Flex>
      </Box>  
    </Box>      
  )

  return (
    <MediaTriggerWrapper media={{ type: 'movie', data: movie }} variant={movie.media_type === 'tv' ? 'link' : variant}>
        {feature}
    </MediaTriggerWrapper>
  );
};

export default TopResult;