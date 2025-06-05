import { Badge, Box, Heading, Text } from "@chakra-ui/react";
import './styles.css'
import { TmdbMovieDetailInterface } from "~/interfaces/tdmi-movie-detail";
import MovieImage from "./movieImage";
import { Link } from "@remix-run/react";
import { getFormattedDate, weightedRating } from "~/utils/helpers";

const MovieHero = ({movie, height = '400px'} : {movie: TmdbMovieDetailInterface, height: string}) => {

    if (!movie) return (<Box width="100%" height={height} backgroundColor="gray.900" rounded="md"></Box>)
    return (
      <>
        <MovieImage backdrop_path={movie.backdrop_path} height={height} />
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
            <Heading as="h1" lineHeight={1} letterSpacing="0.225rem" size="4xl" fontFamily="'Epilogue', sans-serif" fontWeight={400}>{movie.title}</Heading>
            <small>{movie.runtime} mins</small>
          </Box>

          <Text mt={4}>{movie.overview}</Text>
          <Text mt={4}>Released { getFormattedDate({release_date: movie.release_date, options: {year: 'numeric', month: 'long',day: 'numeric'}, region:'en-US'}) }</Text>
          <Box display="flex" gap={4} justifyContent="space-between">
            <Box display="flex" gap={2} mt={4}>
                {
                  movie.genres.map((item, index) => (
                    <Link to={`/genre/${item.name.toLowerCase()}`} key={index}>
                      <Badge size="md" colorPalette="orange"> {item.name} </Badge>
                    </Link>
                  ))
                }
            </Box>
            <Box width="300px" display="flex" flexDirection="column" gap={2} justifyContent="end">
              <Box display="flex" gap={2} alignItems="center" justifyContent="end">
                <Box position="relative" width="100%">
                    <Box position="absolute"  top="0" left="0" zIndex={1} bg="orange.400" height="8px" rounded="md" width={`${(parseFloat(movie.vote_average) / 10) * 100}%`}></Box>
                    <Box bg="gray.200" height="8px" rounded="md" width="100%"></Box>
                </Box>
                <Box width="200px" display="flex" gap={2} alignItems="center">
                  <Text whiteSpace="nowrap">{parseFloat(movie.vote_average).toFixed(1)} / 10</Text>
                  <Text whiteSpace="nowrap" fontSize="xs">{movie.vote_count} ratings</Text>
                </Box>
              </Box>
              <Box display="flex" gap={2} alignItems="center" justifyContent="end">
                <Box position="relative" width="100%">
                    <Box position="absolute"  top="0" left="0" zIndex={1} bg="orange.400" height="8px" rounded="md" width={`${(weightedRating(parseFloat(movie.vote_average), parseInt(movie.vote_count)) / 10) * 100}%`}></Box>
                    <Box bg="gray.200" height="8px" rounded="md" width="100%"></Box>
                </Box>
                <Box width="200px" display="flex" gap={2} alignItems="center">
                  <Text whiteSpace="nowrap">{weightedRating(parseFloat(movie.vote_average), parseInt(movie.vote_count)).toFixed(1)} / 10</Text>
                  {/* <Image src="/public/logo.jpg"  width={10} height={10} alt="Brand"/> */}
                </Box>
              </Box>
            </Box>
          </Box>

        </Box>
      </>
    );
};

export default MovieHero;