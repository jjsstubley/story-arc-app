import { AbsoluteCenter, Box,  ProgressCircle, Text } from "@chakra-ui/react";
import { TmdbMovieDetailWAppendsProps } from "~/interfaces/tmdb/movie/detail";
import { TmdbTVSeriesDetailWAppendsProps } from "~/interfaces/tmdb/tv/series/details";
import { TVSeasonDetailsInterface } from "~/interfaces/tmdb/tv/season/details";
import { TVEpisodeDetailsInterface } from "~/interfaces/tmdb/tv/episode/details";
import { formatReadableNumber } from "~/utils/helpers";
import RatingReviewDialog from "~/components/user-actions/ratings/rating-review-dialog";

type MediaDetails = TmdbTVSeriesDetailWAppendsProps | TmdbMovieDetailWAppendsProps | TVSeasonDetailsInterface | TVEpisodeDetailsInterface;


const RatingCard = ({media} : { media: MediaDetails }) => {
    function getVoteAverage() {
        const voteAverage = parseFloat(media.vote_average.toString());
        
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

    // Determine media type and extract ID and title
    const isMovie = 'title' in media;
    const mediaId = media.id;
    const mediaTitle = isMovie ? (media as TmdbMovieDetailWAppendsProps).title : (media as TmdbTVSeriesDetailWAppendsProps).name;
    const mediaType = isMovie ? 'movie' : 'tv';
    
    const cardContent = (
        <Box 
            colorPalette={getVoteAverage()} 
            bg="blackAlpha.600" 
            rounded="md" 
            p={2} 
            display="flex" 
            alignItems="center" 
            gap={2}
            cursor="pointer"
            _hover={{ bg: "blackAlpha.700" }}
        >
            <ProgressCircle.Root size="lg" value={(parseFloat(media.vote_average.toString()) / 10) * 100} colorPalette={getVoteAverage()}>
                <ProgressCircle.Circle >
                    <ProgressCircle.Track/>
                    <ProgressCircle.Range />
                </ProgressCircle.Circle>
                <AbsoluteCenter>
                    <ProgressCircle.ValueText />
                </AbsoluteCenter>
            </ProgressCircle.Root>
            { 'vote_count' in media && <Text whiteSpace="nowrap" fontSize="xs">{formatReadableNumber(parseInt(media.vote_count.toString()))} ratings</Text>}
        </Box>
    );

    // Only wrap with dialog if it's a movie or TV series (not season/episode)
    if (isMovie || 'name' in media) {
        return (
            <RatingReviewDialog
                mediaId={mediaId}
                mediaTitle={mediaTitle}
                mediaType={mediaType}
            >
                {cardContent}
            </RatingReviewDialog>
        );
    }

    // For seasons/episodes, return without dialog
    return cardContent;
};

export default RatingCard;