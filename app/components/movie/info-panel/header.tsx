import { Box, CloseButton, Image, HStack } from "@chakra-ui/react";
import RatingCard from "../rating-card";
import BasePoster from "~/components/ui/base-poster";
import { TmdbMovieDetailWAppendsProps } from "~/interfaces/tmdb/movie/detail";
import FavouriteToggleWrapper from "~/components/user-actions/favourites/favourite-toggle-wrapper";

const InfoPanelHeader = ({movie, onClose} : { movie: TmdbMovieDetailWAppendsProps, onClose: () => void }) => {
  
    return (
        <Box position="relative">
            <Image 
                src={`https://image.tmdb.org/t/p/original/${movie.backdrop_path}`}
                width="100%" 
                height="100%" 
                aspectRatio={3/2}
                mb={4}
                objectFit="cover" 
                rounded="md"
                filter="grayscale(70%)"
                alt={movie.title}/>
            <Box position="absolute" bottom={4} right={4} zIndex={2} width="20%" aspectRatio={2 / 3}>
                <BasePoster file={movie.poster_path} title={movie.title} cardProps={{
                    border: "none",
                    outline: "1px solid",
                    outlineColor: "gray.200",
                    outlineOffset: "3px",
                    _hover: {
                        border: "none",
                    }
                }} />
            </Box>
            <Box position="absolute" bottom={4} left={4} zIndex={2}>
                <RatingCard movie={movie} />
            </Box>
            <HStack position="absolute" top={4} right={4} zIndex={2} gap={2}>
                <FavouriteToggleWrapper 
                    movieId={movie.id} 
                    movieTitle={movie.title}
                />
                <CloseButton variant="subtle" onClick={onClose} />
            </HStack>
        </Box>
    );
};

export default InfoPanelHeader;