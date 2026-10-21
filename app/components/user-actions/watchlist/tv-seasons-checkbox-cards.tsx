import { Separator } from "@chakra-ui/react"
import { WatchlistPicker } from "~/features/watchlists";
import SaveSeasonCheckbox from "~/components/user-actions/tv-seasons/save-season-checkbox";

export default function TVSeasonsCheckboxCards({ seriesId, seasonNumber } : { seriesId: number, seasonNumber: number }) {
    return (
        <WatchlistPicker movieId={seriesId} mediaType="tv">
            <Separator orientation="horizontal" borderColor={"whiteAlpha.500"} width="100%"/>
            <SaveSeasonCheckbox seriesId={seriesId} seasonNumber={seasonNumber} />
        </WatchlistPicker>
    );
}
