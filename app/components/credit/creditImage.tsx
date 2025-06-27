import { Box, Image } from "@chakra-ui/react";
import './styles.css'

const CreditImage = ({backdrop_path, size='600px'} : {backdrop_path: string, size?: string}) => {
    return (
        <Box position="relative" width="100%" height="100%" overflow="hidden" role="group" aspectRatio={[1,1]}>
          {/* Low-res blurred background image */}
            <Image
            src={`https://image.tmdb.org/t/p/w300/${backdrop_path}`}
            alt="Blurred placeholder"
            position="absolute"
            rounded="full"
            top="0"
            left="0"
            width="100%"
            height="100%"
            aspectRatio={[1,1]}
            objectFit="cover"
            filter="blur(20px)"
            transition="opacity 0.3s"
            aria-hidden
          />

          {/* High-res image */}
          <Image
            src={`https://image.tmdb.org/t/p/original/${backdrop_path}`}
            alt="Backdrop"
            position="absolute"
            // rounded="full"
            filter="grayscale(100%)"
            top="0"
            left="0"
            width="100%"
            height="100%"
            aspectRatio={[1,1]}
            objectFit="cover"
            className="fade-in-image"
          />
        </Box>
    );
};

export default CreditImage;