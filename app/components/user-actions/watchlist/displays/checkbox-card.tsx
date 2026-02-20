import { CheckboxCard, } from "@chakra-ui/react"
import { useEffect, useState } from "react";
import { useWatchlistContext } from "~/components/providers/watchlist-context";
import { checkWatchlist, toggleWatchlist } from "../services";

    export default function WatchListCheckboxCard({ watchlistId, label, description, movieId, addon, mediaType } : { watchlistId: string, label: string, description: string, movieId: number, addon?: string, mediaType?: string }) {
    // const [isAddedToWatchlist, setIsAddedToWatchlist] = useState<boolean>(false);
    const { updateWatchlist, setIsOtherWatchlistsOpen } = useWatchlistContext();
    const [selected, setSelected] = useState<boolean>(false);

    const updateList = async (watchlistId: string) => {
        const response = await toggleWatchlist(watchlistId, movieId, selected, mediaType || 'movie');
        if (!response) {
            console.error("Failed to update watchlist");
            setSelected(false)
            return;
        }
        setSelected(!selected);
        if (watchlistId === "default") {    
            setIsOtherWatchlistsOpen(!selected);
        }  
        updateWatchlist(watchlistId);
    }

    const checkList = async (watchlistId: string) => {
        console.log('checkList watchlistId', watchlistId, movieId);
        const response = await checkWatchlist(watchlistId, movieId);

        console.log('checkList response', watchlistId, response);
        if (response.exists) {
            setSelected(true);
            if (watchlistId === "default") {    
                setIsOtherWatchlistsOpen(true);
            }    
        } else {
            setSelected(false);
            if (watchlistId === "default") {    
                setIsOtherWatchlistsOpen(false);
            }  
        }
    }

    useEffect(() => {
        checkList(watchlistId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [movieId])

    return (
        <CheckboxCard.Root size="sm"  width="100%" onCheckedChange={() => updateList(watchlistId)} onClick={(e) => e.stopPropagation()} checked={selected}>
            <CheckboxCard.HiddenInput />
            <CheckboxCard.Control>
                <CheckboxCard.Content>
                    <CheckboxCard.Label>{ label }</CheckboxCard.Label>
                    <CheckboxCard.Description>{ description }</CheckboxCard.Description>
                </CheckboxCard.Content>
                <CheckboxCard.Indicator />
            </CheckboxCard.Control>
            { addon && (
                <CheckboxCard.Addon>
                    { addon }
                </CheckboxCard.Addon>
            )}
        </CheckboxCard.Root>
    );

}