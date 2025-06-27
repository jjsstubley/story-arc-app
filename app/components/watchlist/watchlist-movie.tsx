import { AbsoluteCenter, Box, HStack, ProgressCircle } from '@chakra-ui/react';
import { TmdbMovieInterface } from '~/interfaces/tmdb/tdmi-movie';
import MovieDialog from '../movie/movie-dialog';
import WatchListDropdown from '../user-actions/watchlist-dropdown';

const WatchlistMovie = ({item} : { item: TmdbMovieInterface }) => {

    return (
        <MovieDialog item={item}>
            <Box 
                width="100%" 
                height="100%" 
                position="relative"
                rounded="md"
                cursor="pointer"
                backgroundImage={`url(https://image.tmdb.org/t/p/w300/${item.poster_path})`} 
                backgroundSize="cover" backgroundPosition="center"
                p={2}
                _before={{
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    bg: "rgba(0, 0, 0, 0.5)", // dark overlay
                }}
                >
                <Box position="relative" zIndex={2}>
                    {item.title}
                </Box>
                <HStack gap={2} justifyContent="flex-start">
                    <WatchListDropdown movieId={item.id} />
                </HStack>

                <Box position="absolute" bottom={2} right={2}>
                    <ProgressCircle.Root size="sm" value={(parseFloat(item.vote_average) / 10) * 100}>
                        <ProgressCircle.Circle >
                            <ProgressCircle.Track/>
                            <ProgressCircle.Range />
                        </ProgressCircle.Circle>
                        <AbsoluteCenter>
                            <ProgressCircle.ValueText />
                        </AbsoluteCenter>
                    </ProgressCircle.Root>
                </Box>
        
            </Box>
            {/* </Card.Root> */}
        </MovieDialog>
    );
};

export default WatchlistMovie;