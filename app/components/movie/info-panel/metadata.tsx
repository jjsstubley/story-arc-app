import { Badge, Box, Text } from "@chakra-ui/react";
import { getFormattedDate, getMovieTags } from "~/utils/helpers";
import ArkHeader from "~/components/ui/ark-header";
import Genres from "../common/genres";
import { TmdbMovieDetailWAppendsProps } from "~/interfaces/tmdb/movie/detail";

const InfoPanelMetadata = ({movie} : { movie: TmdbMovieDetailWAppendsProps }) => {

    return (
        <>
            <Box display="flex" justifyContent="space-between" gap={4} alignItems="flex-start" width="100%">
                <Box flex={1}>
                    <ArkHeader as="h1"fontSize="lg">
                        {movie.title} <Text fontSize="xs" color="whiteAlpha.600" whiteSpace="nowrap">{ getFormattedDate({release_date: movie.release_date, options: {year: 'numeric', month: 'long',day: 'numeric'}, region:'en-US'}) } | { movie.runtime} mins</Text> 
                    </ArkHeader>
                </Box>
                {/* <BsCheck2Circle color="green" size="30px"/> */}  {/* TODO: Add seen status */}
            </Box>
            <Box display="flex" gap={2} mt={4}>
                <Genres genres={movie.genres} />
            </Box>
            <Box display="flex" gap={2} alignItems="center" justifyContent="flex-start">
                {
                    getMovieTags(movie, {minimumVotes: 100, globalAverageRating: 6.8 }).map((tag, index) => ( 
                        <Badge key={index} size="md" colorPalette="red" mt={4}> {tag} </Badge>
                    ))
                }
            </Box>
        </>
    );
};

export default InfoPanelMetadata;