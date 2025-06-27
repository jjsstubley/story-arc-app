import { AbsoluteCenter, Badge, Box, Heading, ProgressCircle, Text } from "@chakra-ui/react";
import './styles.css'
import { TmdbMovieDetailInterface } from "~/interfaces/tmdb/tdmi-movie-detail";
import MovieImage from "./movieImage";
import { Link } from "@remix-run/react";
import { getFormattedDate, getMovieTags } from "~/utils/helpers";
import WatchListDropdown from "../user-actions/watchlist-dropdown";

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
          <Box display="flex" gap={4} alignItems="center">
            <Box display="flex" gap={2} alignItems="end">
              <Heading as="h1" lineHeight={1} letterSpacing="0.225rem" size="4xl" fontFamily="'Epilogue', sans-serif" fontWeight={400}>{movie.title}</Heading>
              <small>{movie.runtime} mins</small>
            </Box>
            <WatchListDropdown movieId={movie.id}/>
            {/* This shows up only once user have mark as seen */}
            {/* <IconButton variant="subtle" border="1px solid" borderColor={"whiteAlpha.300"} rounded="full" onClick={() => setIsFavourite((prev) => !prev)}>
                {isFavourite ? (<Text color="red"><GoHeartFill size={28}/></Text>) : (<Text><GoHeart size={28}/></Text>) }
            </IconButton> */}
          </Box>

          <Text mt={4}>{movie.overview}</Text>
          <Text mt={4}>Released { getFormattedDate({release_date: movie.release_date, options: {year: 'numeric', month: 'long',day: 'numeric'}, region:'en-US'}) }</Text>
          <Box display="flex" gap={4} justifyContent="space-between">
            <Box display="flex" gap={2} mt={4}>
                {
                  movie.genres.map((item, index) => (
                    <Link to={`/genres/${item.name.toLowerCase()}`} key={index}>
                      <Badge size="md" colorPalette="orange"> {item.name} </Badge>
                    </Link>
                  ))
                }
            </Box>
            <Box width="300px" display="flex" flexDirection="column" gap={2} justifyContent="end">
              <Box display="flex" gap={2} alignItems="center" justifyContent="end">
                {/* <Box position="relative" width="100%">
                    <Box position="absolute"  top="0" left="0" zIndex={1} bg="orange.400" height="8px" rounded="md" width={`${(parseFloat(movie.vote_average) / 10) * 100}%`}></Box>
                    <Box bg="gray.200" height="8px" rounded="md" width="100%"></Box>
                </Box> */}
                <ProgressCircle.Root size="md" value={(parseFloat(movie.vote_average) / 10) * 100}>
                  <ProgressCircle.Circle >
                    <ProgressCircle.Track/>
                    <ProgressCircle.Range />
                  </ProgressCircle.Circle>
                  <AbsoluteCenter>
                    <ProgressCircle.ValueText />
                  </AbsoluteCenter>
                </ProgressCircle.Root>
                <Box display="flex" gap={2} alignItems="center">
                  {/* <Text whiteSpace="nowrap">{parseFloat(movie.vote_average).toFixed(1)} / 10</Text> */}
                  <Text whiteSpace="nowrap" fontSize="xs">{movie.vote_count} ratings</Text>
                    {/* <HoverCard.Root size="sm" positioning={{ placement: "top" }}>
                      <HoverCard.Trigger asChild>
                        <CiCircleInfo />
                      </HoverCard.Trigger>
                      <Portal>
                        <HoverCard.Positioner>
                          <HoverCard.Content maxWidth="240px">
                            <HoverCard.Arrow />
                            <Box>
                              <Box >
                                  <Text whiteSpace="nowrap">This movie has a weighted rating of {weightedRating(parseFloat(movie.vote_average), parseInt(movie.vote_count)).toFixed(1)} / 10</Text>
                              </Box>
                              <Box display="flex" gap={2} alignItems="center" justifyContent="end">
                                
                                <Box position="relative" width="100%">
                                    <Box position="absolute"  top="0" left="0" zIndex={1} bg="orange.400" height="8px" rounded="md" width={`${(weightedRating(parseFloat(movie.vote_average), parseInt(movie.vote_count)) / 10) * 100}%`}></Box>
                                    <Box bg="gray.200" height="8px" rounded="md" width="100%"></Box>
                                </Box>
      
                    
                              </Box>
                            </Box>
      
                          </HoverCard.Content>
                        </HoverCard.Positioner>
                      </Portal>
                    </HoverCard.Root> */}
                </Box>
              </Box>
              <Box display="flex" gap={2} alignItems="center" justifyContent="end">
                {
                  getMovieTags(movie, {minimumVotes: 100, globalAverageRating: 6.8 }).map((tag, index) => ( 
                    <Badge key={index} size="md" colorPalette="red"> {tag} </Badge>
                  ))
                }
              </Box>
            </Box>
          </Box>

        </Box>
      </>
    );
};

export default MovieHero;