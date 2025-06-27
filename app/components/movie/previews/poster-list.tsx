import { Box, Card, Image, Text } from '@chakra-ui/react';
import { TmdbMovieInterface } from '~/interfaces/tmdb/tdmi-movie';
import MovieDialog from '../movie-dialog';
import { BsFilm } from "react-icons/bs";

const MoviePosterList = ({item} : { item: TmdbMovieInterface }) => {
item.poster_path
    return (
        <MovieDialog item={item}>
            <Box display="flex" gap={2} alignItems="center">
                <Card.Root width={10} aspectRatio={2 / 3}>
                    <Card.Body 
                        position="relative"
                        width="100%"
                        height="100%"
                        aspectRatio={2 / 3}
                        gap="2" 
                        p={0} 
                        overflow="hidden" 
                        rounded="md" 
                        border="1px solid transparent" 
                        _hover={{
                            border: "1px solid white"
                        }}
                    >
                        {
                            item.poster_path ? (
                                <Image 
                                    src={`https://image.tmdb.org/t/p/w300/${item.poster_path}`}
                                    width="100%" 
                                    height="100%" 
                                    aspectRatio={2 / 3}
                                    objectFit="cover" 
                                    transition="transform 0.3s ease"
                                    _hover={{
                                        transform: "scale(1.05)",
                                        cursor: "pointer",
                                    }}
                                    alt={item.title}/>
                            ) : (
                                <Box width="100%" height="100%" p={12} aspectRatio={2 / 3} display="flex" alignItems="flex-start" justifyContent="center" bg="gray.700">
                                    <BsFilm size="xl"/>
                                </Box>
                            )
                        }
                    </Card.Body>
                </Card.Root>
                <Box width="100%" color="white" pt={2} textAlign="left">
                    <Text fontSize="xs" color="whiteAlpha.600">{item.title}</Text>
                </Box>
            </Box>
        </MovieDialog>
    );
};

export default MoviePosterList;