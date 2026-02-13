import { TmdbTVSeriesSummaryInterface } from '~/interfaces/tmdb/tv/series/summary';

import { Box } from '@chakra-ui/react';
import { TmdbTVSeriesDetailWAppendsProps } from '~/interfaces/tmdb/tv/series/details';
import { MediaItem, useMediaPanel } from '~/components/providers/media-provider';

const TvSeriesPanelTrigger = ({item, children} : { item: TmdbTVSeriesSummaryInterface, children: React.ReactNode; }) => {
    const { openPanel } = useMediaPanel();

    async function getTvSeriesDetails() {
        const res = await fetch(`/api/tv/series/${item.id}`)
        const data = await res.json()

        const mediaItem = {
            type: 'tv',
            data: data.movieDetails as TmdbTVSeriesDetailWAppendsProps
        }

        openPanel(mediaItem as MediaItem)
    }


    return (
        <Box onClick={getTvSeriesDetails}>
            {children}
        </Box>
    );
};

export default TvSeriesPanelTrigger;