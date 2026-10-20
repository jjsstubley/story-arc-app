import { CheckboxCard } from "@chakra-ui/react"
import { useEffect } from "react";
import { checkTVSeason, toggleTVSeason } from "~/components/user-actions/watchlist/services";
import { useOptimisticToggle } from "~/components/user-actions/watchlist/use-optimistic-toggle";

export default function SaveSeasonCheckbox({ seriesId, seasonNumber } : { seriesId: number, seasonNumber: number }) {
    const { selected, setSelected, toggle } = useOptimisticToggle("TV Seasons");

    const updateList = async () => {
        await toggle((wasSelected) => toggleTVSeason(seriesId, seasonNumber, wasSelected));
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

