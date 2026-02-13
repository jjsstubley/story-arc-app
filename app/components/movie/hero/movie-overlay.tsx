import { Badge, Box, Heading, Text } from "@chakra-ui/react";
import '../movie-dialog'
import { getFormattedDate, getMovieTags } from "~/utils/helpers";
import WatchListDropdown from "~/components/user-actions/watchlist/dropdown";
import Genres from "../common/genres";
import RatingCard from "../rating-card";
import { TmdbMovieDetailWAppendsProps } from "~/interfaces/tmdb/movie/detail";

const MovieOverlay = ({movie} : {movie: TmdbMovieDetailWAppendsProps}) => {

  return (
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
          <Genres genres={movie.genres} />
        </Box>
        <Box width="300px" display="flex" flexDirection="column" gap={2} justifyContent="end">
          <Box display="flex" gap={2} alignItems="center" justifyContent="end">
            <RatingCard movie={movie} />
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
  );
};

export default MovieOverlay;