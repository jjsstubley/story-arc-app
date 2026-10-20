import { CheckboxCard } from "@chakra-ui/react"
import { useEffect } from "react";
import { checkTVEpisode, toggleTVEpisode } from "~/components/user-actions/watchlist/services";
import { useOptimisticToggle } from "~/components/user-actions/watchlist/use-optimistic-toggle";

export default function SaveEpisodeCheckbox({ seriesId, seasonNumber, episodeNumber } : { seriesId: number, seasonNumber: number, episodeNumber: number }) {
    const { selected, setSelected, toggle } = useOptimisticToggle("TV Episodes");

    const updateList = async () => {
        await toggle((wasSelected) => toggleTVEpisode(seriesId, seasonNumber, episodeNumber, wasSelected));
    }

    const checkList = async () => {
        console.log('checkList seriesId', seriesId, 'seasonNumber', seasonNumber, 'episodeNumber', episodeNumber);
        const response = await checkTVEpisode(seriesId, seasonNumber, episodeNumber);

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
    }, [seriesId, seasonNumber, episodeNumber])

    return (
        <CheckboxCard.Root size="sm" width="100%" onCheckedChange={() => updateList()} onClick={(e) => e.stopPropagation()} checked={selected}>
            <CheckboxCard.HiddenInput />
            <CheckboxCard.Control>
                <CheckboxCard.Content>
                    <CheckboxCard.Label>Add to TV Episodes</CheckboxCard.Label>
                    <CheckboxCard.Description>Save this episode to your TV Episodes collection</CheckboxCard.Description>
                </CheckboxCard.Content>
                <CheckboxCard.Indicator />
            </CheckboxCard.Control>
        </CheckboxCard.Root>
    );
}

