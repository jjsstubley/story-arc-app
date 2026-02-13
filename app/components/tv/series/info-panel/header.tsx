import { Box, CloseButton, Image } from "@chakra-ui/react";
import RatingCard from "~/components/media/rating-card";
import BasePoster from "~/components/ui/base-poster";
import { TmdbTVSeriesDetailWAppendsProps } from "~/interfaces/tmdb/tv/series/details";

const InfoPanelHeader = ({series, onClose} : { series: TmdbTVSeriesDetailWAppendsProps, onClose: () => void }) => {
  
    return (
        <Box position="relative">
            <Image 
                src={`https://image.tmdb.org/t/p/original/${series.backdrop_path}`}
                width="100%" 
                height="100%" 
                aspectRatio={3/2}
                mb={4}
                objectFit="cover" 
                rounded="md"
                filter="grayscale(70%)"
                alt={series.name}/>
            <Box position="absolute" bottom={4} right={4} zIndex={2} width="20%" aspectRatio={2 / 3}>
                <BasePoster file={series.poster_path} title={series.name} cardProps={{
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
                <RatingCard media={series} />
            </Box>
            <CloseButton variant="subtle" onClick={onClose} position="absolute" top={4} left={4} zIndex={2}/>
        </Box>
    );
};

export default InfoPanelHeader;