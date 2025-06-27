import { Box, Card, Image, Strong, Text } from '@chakra-ui/react';
import { TmdbMovieInterface } from '~/interfaces/tmdb/tdmi-movie';
import MovieDialog from '../movie-dialog';
import { BsFilm } from "react-icons/bs";
import { getFormattedDate } from '~/utils/helpers';

const MovieFeaturette = ({item} : { item: TmdbMovieInterface }) => {
item.poster_path
    return (
        <MovieDialog item={item}>
            <Box>
                <Card.Root width="100%" aspectRatio={4 / 3}>
                    <Card.Body 
                        position="relative"
                        width="100%"
                        height="100%"
                        aspectRatio={4 / 3}
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
                            item.backdrop_path ? (
                                <Image 
                                    src={`https://image.tmdb.org/t/p/original/${item.backdrop_path}`}
                                    width="100%" 
                                    height="100%" 
                                    aspectRatio={4 / 3}
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
                        <Box position="absolute" bottom={0} left={0} bg="rgba(0,0,0,0.4)" width="100%">
                            <Box p={2}>
                                <Text fontSize="xs" color="white">{item.title} <Strong>({ getFormattedDate({release_date: item.release_date, options: {year: 'numeric', month: 'long',day: 'numeric'}, region:'en-US'}) })</Strong></Text>
                            </Box>
                        </Box>
                    </Card.Body>
                </Card.Root>
                {/* <Box width="100%" color="white" pt={2} textAlign="left">
                    <Text fontSize="xs" color="whiteAlpha.600">{item.title}</Text>
                </Box> */}
            </Box>
        </MovieDialog>
    );
};

export default MovieFeaturette;