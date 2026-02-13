import { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { Drawer, Portal } from '@chakra-ui/react';
import { TmdbMovieSummaryInterface } from '~/interfaces/tmdb/movie/summary';
import { TmdbMovieDetailWAppendsProps } from '~/interfaces/tmdb/movie/detail';
import { MovieInfoPanel } from '~/components/movie/info-panel';

const MovieSheet = ({item, children} : { item: TmdbMovieSummaryInterface, children: React.ReactNode; }) => {
    const [open, setOpen] = useState(false);
    const [movieDetails, setMovieDetails] = useState<TmdbMovieDetailWAppendsProps | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function getMovieDetails() {
        setLoading(true);
        const res = await fetch(`/api/movie/${item.id}`)
        const data = await res.json()

        if (!res.ok) {
            setError(data.error)
        }

        setMovieDetails(data.movieDetails)
        setLoading(false)
    }

    useEffect(() => {
        if (open) {
            getMovieDetails()
        }
      }, [open]);

    return (
        <>
            <Box onClick={() => setOpen(true)} cursor="pointer">
                {children}
            </Box>
            <Drawer.Root 
                open={open} 
                onOpenChange={(e) => setOpen(e.open)}
                placement="end"
                size="lg"
            >
                <Portal>
                    <Drawer.Backdrop />
                    <Drawer.Positioner>
                        <Drawer.Content>
                            <Drawer.Body>
                                {loading && !movieDetails && (
                                    <Box p={4} display="flex" alignItems="center" justifyContent="center" height="400px">
                                        Loading...
                                    </Box>
                                )}
                                {error && (
                                    <Box p={4} display="flex" alignItems="center" justifyContent="center" height="400px" color="red.500">
                                        An error occurred: {error}
                                    </Box>
                                )}
                                {movieDetails && (
                                    <MovieInfoPanel 
                                        movie={movieDetails} 
                                        onClose={() => setOpen(false)} 
                                    />
                                )}
                            </Drawer.Body>
                        </Drawer.Content>
                    </Drawer.Positioner>
                </Portal>
            </Drawer.Root>
        </>
    );
};

export default MovieSheet;

