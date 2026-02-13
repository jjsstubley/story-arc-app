import { Box, CloseButton, Image } from "@chakra-ui/react";
// import RatingCard from "~/components/media/rating-card";
import BasePoster from "~/components/ui/base-poster";
import { TmdbCollectionsInterface } from "~/interfaces/tmdb/tmdb-collections";

const CollectionInfoPanelHeader = ({collection, onClose} : { collection: TmdbCollectionsInterface, onClose: () => void }) => {
  
    return (
        <Box position="relative">
            <Image 
                src={`https://image.tmdb.org/t/p/w300/${collection.backdrop_path}`}
                width="100%" 
                height="100%" 
                aspectRatio={3/2}
                mb={4}
                objectFit="cover" 
                rounded="md"
                filter="grayscale(70%)"
                alt={collection.name}/>
            <Box position="absolute" bottom={4} right={4} zIndex={2} width="20%" aspectRatio={2 / 3}>
                <BasePoster file={collection.poster_path} title={collection.name} cardProps={{
                    border: "none",
                    outline: "1px solid",
                    outlineColor: "gray.200",
                    outlineOffset: "3px",
                    _hover: {
                        border: "none",
                    }
                }} />
            </Box>
            {/* <Box position="absolute" bottom={4} left={4} zIndex={2}>
                <RatingCard movie={collection} />
            </Box> */}
            <CloseButton variant="subtle" onClick={onClose} position="absolute" top={4} left={4} zIndex={2}/>
        </Box>
    );
};

export default CollectionInfoPanelHeader;