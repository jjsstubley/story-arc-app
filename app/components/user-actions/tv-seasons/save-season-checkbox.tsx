import { CheckboxCard } from "@chakra-ui/react"
import { useEffect, useState } from "react";
import { checkTVSeason, toggleTVSeason } from "~/components/user-actions/watchlist/services";

export default function SaveSeasonCheckbox({ seriesId, seasonNumber } : { seriesId: number, seasonNumber: number }) {
    const [selected, setSelected] = useState<boolean>(false);

    const updateList = async () => {
        const response = await toggleTVSeason(seriesId, seasonNumber, selected);
        if (!response) {
            console.error("Failed to update saved TV season");
            setSelected(false)
            return;
        }
        setSelected(!selected);
    }

    const checkList = async () => {
        console.log('checkList seriesId', seriesId, 'seasonNumber', seasonNumber);
        const response = await checkTVSeason(seriesId, seasonNumber);

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
    }, [seriesId, seasonNumber])

    return (
        <CheckboxCard.Root size="sm" width="100%" onCheckedChange={() => updateList()} onClick={(e) => e.stopPropagation()} checked={selected}>
            <CheckboxCard.HiddenInput />
            <CheckboxCard.Control>
                <CheckboxCard.Content>
                    <CheckboxCard.Label>Add to TV Seasons</CheckboxCard.Label>
                    <CheckboxCard.Description>Save this season to your TV Seasons collection</CheckboxCard.Description>
                </CheckboxCard.Content>
                <CheckboxCard.Indicator />
            </CheckboxCard.Control>
        </CheckboxCard.Root>
    );
}

