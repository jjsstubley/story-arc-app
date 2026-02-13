import { TmdbMovieSummaryInterface } from '~/interfaces/tmdb/movie/summary';

import { Box } from '@chakra-ui/react';
import { TmdbMovieDetailWAppendsProps } from '~/interfaces/tmdb/movie/detail';
import { MediaItem, useMediaPanel } from '~/components/providers/media-provider';

const MoviePanelTrigger = ({item, children} : { item: TmdbMovieSummaryInterface, children: React.ReactNode; }) => {
    const { openPanel } = useMediaPanel();

    async function getMovieDetails() {
        console.log('getMovieDetails');
        // setSelectedMovie(null)
        const res = await fetch(`/api/movie/${item.id}`)
        const data = await res.json()

        const mediaItem = {
            type: 'movie',
            data: data.movieDetails as TmdbMovieDetailWAppendsProps
        }

        openPanel(mediaItem as MediaItem)
    }


    return (
        <Box onClick={getMovieDetails}>
            {children}
        </Box>
    );
};

export default MoviePanelTrigger;