import { Box, CloseButton, Image } from "@chakra-ui/react";
import BasePoster from "~/components/ui/base-poster";
import { TVSeriesDetailsInterface } from "~/interfaces/tmdb/tv/series/details";
import RatingCard from "../rating-card";
import { TmdbMovieDetailWAppendsProps } from "~/interfaces/tmdb/movie/detail";

type MediaDetails = TVSeriesDetailsInterface | TmdbMovieDetailWAppendsProps;

interface InfoPanelHeaderProps {
  media: MediaDetails;
  onClose: () => void;
}

const InfoPanelHeader = ({media, onClose} : InfoPanelHeaderProps) => {
    const title = 'title' in media ? media.title : media.name;
    const backdropPath = media.backdrop_path;
    const posterPath = media.poster_path;
    return (
        <Box position="relative">
            <Image 
                src={`https://image.tmdb.org/t/p/original/${backdropPath}`}
                width="100%" 
                height="100%" 
                aspectRatio={3/2}
                mb={4}
                objectFit="cover" 
                rounded="md"
                filter="grayscale(70%)"
                alt={title}/>
            <Box position="absolute" bottom={4} right={4} zIndex={2} width="20%" aspectRatio={2 / 3}>
                <BasePoster file={posterPath} title={title} cardProps={{
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
                <RatingCard media={media} />
            </Box>
            <CloseButton variant="subtle" onClick={onClose} position="absolute" top={4} left={4} zIndex={2}/>
        </Box>
    );
};

export default InfoPanelHeader;