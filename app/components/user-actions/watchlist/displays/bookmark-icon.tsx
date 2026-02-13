import { Text, IconButton, } from "@chakra-ui/react"
import { useEffect, useState } from "react";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { useWatchlistContext } from "~/components/providers/watchlist-context";
import { checkWatchlist, toggleWatchlist } from "../services";

export default function BookmarkIcon({ watchlistId, movieId, isDefault } : { watchlistId: string,  movieId: number, isDefault: boolean }) {
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
        <IconButton size="xs" variant="subtle" border="1px solid" borderColor={"whiteAlpha.300"} rounded="full" onClick={() => updateList(watchlist)}>
            {selected ? (<Text color="gold"><IoBookmark size={28}/></Text>) : (<><IoBookmarkOutline size={28} /></> )}
        </IconButton>
    );

}