import { Separator } from "@chakra-ui/react"
import { WatchlistPicker } from "~/features/watchlists";
import SaveSeriesCheckbox from "~/components/user-actions/tv-series/save-series-checkbox";

export default function TVSeriesCheckboxCards({ seriesId } : { seriesId: number }) {
    return (
        <WatchlistPicker movieId={seriesId} mediaType="tv">
            <Separator orientation="horizontal" borderColor={"whiteAlpha.500"} width="100%"/>
            <SaveSeriesCheckbox seriesId={seriesId} />
        </WatchlistPicker>
    );
}
