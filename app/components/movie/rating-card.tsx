import { AbsoluteCenter, Box,  ProgressCircle, Text } from "@chakra-ui/react";
import { TmdbMovieDetailWAppendsProps } from "~/interfaces/tmdb/movie/detail";
import { formatReadableNumber } from "~/utils/helpers";

const RatingCard = ({movie} : { movie: TmdbMovieDetailWAppendsProps }) => {
    function getVoteAverage() {
        const voteAverage = parseFloat(movie.vote_average.toString());
        
        if (voteAverage < 4) {
          return 'red';
        } else if (voteAverage < 6) {
          return 'orange';
        } else if (voteAverage < 7.5) {
            return 'yellow';
        } else {
          return 'green';
        }
    }
    
    return (
        <Box colorPalette={getVoteAverage()} bg="blackAlpha.600" rounded="md" p={2} display="flex" alignItems="center" gap={2}>
            <ProgressCircle.Root size="lg" value={(parseFloat(movie.vote_average.toString()) / 10) * 100} colorPalette={getVoteAverage()}>
                <ProgressCircle.Circle >
                    <ProgressCircle.Track/>
                    <ProgressCircle.Range />
                </ProgressCircle.Circle>
                <AbsoluteCenter>
                    <ProgressCircle.ValueText />
                </AbsoluteCenter>
            </ProgressCircle.Root>
            <Text whiteSpace="nowrap" fontSize="xs">{formatReadableNumber(parseInt(movie.vote_count.toString()))} ratings</Text>
        </Box>
    );
};

export default RatingCard;