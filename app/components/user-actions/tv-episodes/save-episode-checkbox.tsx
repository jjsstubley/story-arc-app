import { CheckboxCard } from "@chakra-ui/react"
import { useEffect, useState } from "react";
import { checkTVEpisode, toggleTVEpisode } from "~/components/user-actions/watchlist/services";

export default function SaveEpisodeCheckbox({ seriesId, seasonNumber, episodeNumber } : { seriesId: number, seasonNumber: number, episodeNumber: number }) {
    const [selected, setSelected] = useState<boolean>(false);

    const updateList = async () => {
        const response = await toggleTVEpisode(seriesId, seasonNumber, episodeNumber, selected);
        if (!response) {
            console.error("Failed to update saved TV episode");
            setSelected(false)
            return;
        }
        setSelected(!selected);
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

