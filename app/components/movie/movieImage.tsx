import { Box, Image } from "@chakra-ui/react";
import './styles.css'

const MovieImage = ({backdrop_path, height = '600px'} : {backdrop_path: string, height?: string}) => {
    const sharedAttributes = {
      position: 'absolute',
      top: 0,
      left: 0,
      height: '100%',
      width: '100%',
      objectFit: 'cover',
      aspectRatio: [1,1]
    }
    const imgConfig = [
      {
        type: 'lowRes',
        resolution: 'w300',
        attributes : {
          alt: 'Blurred placeholder',
          filter: 'blur(20px)',
          transform: "scale(1.05)",
          transition: "opacity 0.3s",
          "aria-hidden": true
        }

      },
      {
        type: 'highRes',
        resolution: 'original',
        attributes: {
          className: 'fade-in-image',
          transition:"transform 20s ease",
          _hover: {
            transform: "scale(1.25)",
            cursor: "pointer",
          }
        }
      }
    ]
    return (
        <Box position="relative" width="100%" height={height} overflow="hidden" role="group">
            <Box width="100%" height="100%" filter="blur(20px)" position="absolute" top="0" left="0" backgroundColor="grey.200"></Box>
            {
              imgConfig.map((i, index) => (
                <Image
                  key={index}
                  src={`https://image.tmdb.org/t/p/${i.resolution}/${backdrop_path}`}
                  {...sharedAttributes}
                  {...i.attributes} />
              ))
            }
        </Box>
    );
};

export default MovieImage;