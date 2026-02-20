import { CheckboxCard } from "@chakra-ui/react"
import { useEffect, useState } from "react";
import { checkTVSeries, toggleTVSeries } from "~/components/user-actions/watchlist/services";
import { useWatchlistContext } from "~/components/providers/watchlist-context";

export default function SaveSeriesCheckbox({ seriesId } : { seriesId: number }) {
    const [selected, setSelected] = useState<boolean>(false);
    const { updateWatchlist } = useWatchlistContext();

    const updateList = async () => {
        const response = await toggleTVSeries(seriesId, selected);
        if (!response) {
            console.error("Failed to update saved TV series");
            setSelected(false)
            return;
        }
        setSelected(!selected);
        // Trigger refresh of saved series list
        updateWatchlist('saved-tv-series');
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

