import { Box, CloseButton, Image } from "@chakra-ui/react";
import RatingCard from "~/components/media/rating-card";
import BasePoster from "~/components/ui/base-poster";
import { TVEpisodeDetailsInterface } from "~/interfaces/tmdb/tv/episode/details";

const InfoPanelHeader = ({episode, onClose} : { episode: TVEpisodeDetailsInterface, onClose: () => void }) => {
  
    return (
        <Box position="relative">
            <Image 
                src={`https://image.tmdb.org/t/w300/${episode.still_path}`}
                width="100%" 
                height="100%" 
                aspectRatio={3/2}
                mb={4}
                objectFit="cover" 
                rounded="md"
                filter="grayscale(70%)"
                alt={episode.name}/>
            <Box position="absolute" bottom={4} right={4} zIndex={2} width="20%" aspectRatio={2 / 3}>
                <BasePoster file={episode.still_path} title={episode.name} cardProps={{
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
                <RatingCard media={episode} />
            </Box>
            <CloseButton variant="subtle" onClick={onClose} position="absolute" top={4} left={4} zIndex={2}/>
        </Box>
    );
};

export default InfoPanelHeader;