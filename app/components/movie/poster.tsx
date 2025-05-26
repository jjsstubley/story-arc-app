import { Box, Card, Image } from '@chakra-ui/react';
import { TmdbMovieInterface } from '~/interfaces/tdmi-movie';
import MovieDialog from './movie-dialog';

const MoviePoster = ({item} : { item: TmdbMovieInterface }) => {

    return (
        <MovieDialog item={item}>
            <>
                <Card.Root width="100%">
                    <Card.Body gap="2" p={0} overflow="hidden" rounded="md" border="1px solid transparent" 
                        _hover={{
                            border: "1px solid white"
                        }}
                    >
                        <Image 
                            src={`https://image.tmdb.org/t/p/w300/${item.poster_path}`}
                            width="100%" 
                            height="100%" 
                            objectFit="cover" 
                            transition="transform 0.3s ease"
                            _hover={{
                            transform: "scale(1.05)",
                            cursor: "pointer",
                            }}
                            alt=""/>
                    </Card.Body>
                </Card.Root>
                <Box width="100%" color="white" pt={4}>
                    {item.title}
                </Box>
            </>
        </MovieDialog>
    );
};

export default MoviePoster;