import { Separator } from "@chakra-ui/react"
import { WatchlistPicker } from "~/features/watchlists";
import SaveEpisodeCheckbox from "~/components/user-actions/tv-episodes/save-episode-checkbox";

export default function TVEpisodesCheckboxCards({ seriesId, seasonNumber, episodeNumber } : { seriesId: number, seasonNumber: number, episodeNumber: number }) {
    return (
        <WatchlistPicker movieId={seriesId} mediaType="tv">
            <Separator orientation="horizontal" borderColor={"whiteAlpha.500"} width="100%"/>
            <SaveEpisodeCheckbox seriesId={seriesId} seasonNumber={seasonNumber} episodeNumber={episodeNumber} />
        </WatchlistPicker>
    );
}
