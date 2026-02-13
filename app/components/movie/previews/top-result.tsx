import { Box, Text, HStack } from "@chakra-ui/react";
import '~/styles.css'

import { TmdbMovieSummaryInterface } from "~/interfaces/tmdb/movie/summary";

import MoviePoster from "./poster";
import ArkHeader from "~/components/ui/ark-header";
import RatingCard from "../rating-card";
import { useEffect, useState } from "react";
import { TmdbMovieDetailWAppendsProps } from "~/interfaces/tmdb/movie/detail";
import { getFormattedDate } from "~/utils/helpers";
import WatchListDropdown from "~/components/user-actions/watchlist/dropdown";

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
  
  const feature = (
    <Box bg="blackAlpha.400" rounded="md" p={4}>
      <Box display="flex"  justifyContent="space-between" gap={4} bgImage={`https://image.tmdb.org/t/p/w300/${movie.backdrop_path}`} bgSize="cover" bgRepeat="no-repeat">
        <Box minW="100px" maxW="200px">
          <MoviePoster item={movie} includeTitle={false} />
        </Box>
        <Box
          color="white"
          display="flex"
          flex={1}
          pt={4}
          flexDirection="column"
          gap={4}
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