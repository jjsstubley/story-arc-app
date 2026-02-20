

import { Box } from '@chakra-ui/react';
import { TVSeasonSummaryInterface } from '~/interfaces/tmdb/tv/season/summary';
import { TVSeasonDetailsInterface } from '~/interfaces/tmdb/tv/season/details';
import { MediaItem, useMediaPanel } from '~/components/providers/media-provider';

const TvSeasonPanelTrigger = ({item, children, seriesId} : { item: TVSeasonSummaryInterface, children: React.ReactNode; seriesId: number }) => {
    const { openPanel } = useMediaPanel();

    async function getTvSeriesDetails() {
        const res = await fetch(`/api/tv/series/${seriesId}/season/${item.season_number}`)
        const data = await res.json()

        console.log('TvSeasonPanelTrigger data', data)

        const mediaItem = {
            type: 'tv-season',
            data: data.movieDetails as TVSeasonDetailsInterface,
            seriesId: seriesId
        }

        openPanel(mediaItem as MediaItem)
    }


    return (
        <Box onClick={getTvSeriesDetails}>
            {children}
        </Box>
    );
};

export default TvSeasonPanelTrigger;