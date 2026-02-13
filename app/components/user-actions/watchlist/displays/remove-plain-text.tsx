import { Text } from "@chakra-ui/react"
import { useEffect, useState } from "react";
import { useWatchlistContext } from "~/components/providers/watchlist-context";
import { checkWatchlist, toggleWatchlist } from "../services";
import { CiBookmarkRemove } from "react-icons/ci";
export default function RemovePlainText({ watchlistId, movieId, isDefault } : { watchlistId: string,  movieId: number, isDefault: boolean }) {
    // const [isAddedToWatchlist, setIsAddedToWatchlist] = useState<boolean>(false);
    const { updateWatchlist } = useWatchlistContext();
    const [selected, setSelected] = useState<boolean>(false);
    const watchlist = isDefault ? "default" : watchlistId;

    const updateList = async (watchlist: string) => {
        const response = await toggleWatchlist(watchlist, movieId, selected);
            if (!response) {
            console.error("Failed to update watchlist");
            setSelected(false)
            return;
        }
        setSelected(!selected);
        updateWatchlist(watchlist);
    }

    const checkList = async (watchlist: string) => {
        const response = await checkWatchlist(watchlist, movieId);
        if (response.exists) {
            setSelected(true);
        }
    }       

    useEffect(() => {
        checkList(watchlist);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <CiBookmarkRemove />
            <Text onClick={() => updateList(watchlist)}>Remove</Text>
        </>
    );

}