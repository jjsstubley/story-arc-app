import { Box, Image } from "@chakra-ui/react";
import './styles.css'

const MovieSummary = ({backdrop_path} : {backdrop_path: string}) => {
    return (
        <Box position="relative" width="100%" height="600px" overflow="hidden" role="group">
          {/* Low-res blurred background image */}
            <Box width="100%" height="100%" filter="blur(20px)" position="absolute" top="0" left="0" backgroundColor="grey.200"></Box>
            <Image
            src={`https://image.tmdb.org/t/p/w300/${backdrop_path}`}
            alt="Blurred placeholder"
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            objectFit="cover"
            filter="blur(20px)"
            transform="scale(1.05)"
            transition="opacity 0.3s"
            aria-hidden
          />

          {/* High-res image */}
          <Image
            src={`https://image.tmdb.org/t/p/original/${backdrop_path}`}
            alt="Backdrop"
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            objectFit="cover"
            className="fade-in-image"
          />
        </Box>
    );
};

export default MovieSummary;