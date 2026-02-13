import { Box, Image } from "@chakra-ui/react";
import '~/styles.css'

const CreditImage = ({backdrop_path} : {backdrop_path: string, size?: string}) => {
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
        filter: 'blur(20px) grayscale(100%)',
        "aria-hidden": true
      }

    },
    {
      type: 'highRes',
      resolution: 'original',
      attributes: {
        className: 'fade-in-image',
        filter:'grayscale(100%)',

      }
    }
  ]
    return (
      <Box position="relative" width="100%" rounded="full" overflow="hidden" role="group" aspectRatio={[1,1]}>
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

export default CreditImage;