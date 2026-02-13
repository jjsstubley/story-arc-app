import { TmdbMovieSummaryInterface } from '~/interfaces/tmdb/movie/summary';
import { Box } from '@chakra-ui/react';
import { TmdbMovieDetailWAppendsProps } from '~/interfaces/tmdb/movie/detail';
import { TmdbTVSeriesSummaryInterface } from '~/interfaces/tmdb/tv/series/summary';
import { TmdbTVSeriesDetailWAppendsProps } from '~/interfaces/tmdb/tv/series/details';
import { MediaItem, useMediaPanel } from '~/components/providers/media-provider';

const MediaPanelTrigger = ({item, children} : { item: TmdbMovieSummaryInterface | TmdbTVSeriesSummaryInterface, children: React.ReactNode; }) => {
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

    async function getTVSeriesDetails() {
        console.log('getMovieDetails');
        // setSelectedMovie(null)
        const res = await fetch(`/api/tv/series/${item.id}`)
        const data = await res.json()

        const mediaItem = {
            type: 'tv',
            data: data.movieDetails as TmdbTVSeriesDetailWAppendsProps
        }

        openPanel(mediaItem as MediaItem)
    }
    
    async function getMediaDetails() {
        if (item.media_type === 'tv') {
            getTVSeriesDetails()
        } else {
            getMovieDetails()
        }
    }


    return (
        <Box onClick={getMediaDetails}>
            {children}
        </Box>
    );
};

export default MediaPanelTrigger;