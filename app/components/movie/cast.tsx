import { Box, Card, Image, Text } from '@chakra-ui/react';
// import { Link, useLocation } from "@remix-run/react";
import { CastInterface } from '~/interfaces/people';

const Cast = ({item} : { item: CastInterface }) => {
    // const location = useLocation();
    return (
        <Box>
            <Card.Root width="100%">
                <Card.Body gap="2" p={0} overflow="hidden" rounded="md" border="1px solid transparent" 
                    _hover={{
                        border: "1px solid white"
                    }}
                >
                    <Box position="relative" width="100%" height="100%">
                        <Image 
                            src={`https://image.tmdb.org/t/p/original/${item.profile_path}`}
                            width="100%" 
                            height="100%" 
                            objectFit="cover" 
                            transition="transform 0.3s ease"
                            filter= 'grayscale(100%)'
                            _hover={{
                            transform: "scale(1.05)",
                            cursor: "pointer",
                            filter: 'grayscale(0%)'
                            }}
                            alt=""/>
                        <Box
                            position="absolute"
                            bottom="0"
                            left="0"
                            width="100%"
                            bgGradient="to-t" gradientFrom="blackAlpha.800" gradientTo="transparent" gradientVia="blackAlpha.800"
                            color="white"
                            p={4}
                            ><Text fontSize="xs">{item.character}</Text></Box>
                    </Box>

                </Card.Body>
            </Card.Root>
            <Box width="100%" color="white" pt={4}>
                {item.name}
            </Box>
            {/* <Box width="100%" color="white" pt={4}>
                {item.name}
            </Box> */}
        </Box>
    );
};

export default Cast;