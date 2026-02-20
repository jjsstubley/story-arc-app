

import { Box } from '@chakra-ui/react';
import { TVEpisodeSummaryInterface } from '~/interfaces/tmdb/tv/episode/summary';
import { MediaItem, useMediaPanel } from '~/components/providers/media-provider';
import { TVEpisodeDetailsInterface } from '~/interfaces/tmdb/tv/episode/details';

const TvEpisodePanelTrigger = ({item, children, seriesId} : { item: TVEpisodeSummaryInterface, children: React.ReactNode; seriesId: number }) => {
    const { openPanel } = useMediaPanel();

    async function getTvSeriesDetails() {
        const res = await fetch(`/api/tv/series/${seriesId}/season/${item.season_number}/episode/${item.episode_number}`)
        const data = await res.json()

        console.log('TvEpisodePanelTrigger data', data)

        const mediaItem = {
            type: 'tv-episode',
            data: data.movieDetails as TVEpisodeDetailsInterface,
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

export default TvEpisodePanelTrigger;