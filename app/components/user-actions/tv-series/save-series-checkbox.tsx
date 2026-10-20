import { CheckboxCard } from "@chakra-ui/react"
import { useEffect } from "react";
import { checkTVSeries, toggleTVSeries } from "~/components/user-actions/watchlist/services";
import { useWatchlistContext } from "~/components/providers/watchlist-context";
import { useOptimisticToggle } from "~/components/user-actions/watchlist/use-optimistic-toggle";

export default function SaveSeriesCheckbox({ seriesId } : { seriesId: number }) {
    const { selected, setSelected, toggle } = useOptimisticToggle("TV Series");
    const { updateWatchlist } = useWatchlistContext();

    const updateList = async () => {
        const ok = await toggle((wasSelected) => toggleTVSeries(seriesId, wasSelected));
        if (ok) {
            // Trigger refresh of saved series list
            updateWatchlist('saved-tv-series');
        }
    }

    const checkList = async () => {
        console.log('checkList seriesId', seriesId);
        const response = await checkTVSeries(seriesId);

        console.log('checkList response', response);
        if (response.exists) {
            setSelected(true);
        } else {
            setSelected(false);
        }
    }

    useEffect(() => {
        checkList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seriesId])

    return (
        <CheckboxCard.Root size="sm" width="100%" onCheckedChange={() => updateList()} onClick={(e) => e.stopPropagation()} checked={selected}>
            <CheckboxCard.HiddenInput />
            <CheckboxCard.Control>
                <CheckboxCard.Content>
                    <CheckboxCard.Label>Add to TV Series</CheckboxCard.Label>
                    <CheckboxCard.Description>Save this series to your TV Series collection</CheckboxCard.Description>
                </CheckboxCard.Content>
                <CheckboxCard.Indicator />
            </CheckboxCard.Control>
        </CheckboxCard.Root>
    );
}

