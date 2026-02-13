import { WatchlistItemInterface } from "~/interfaces/watchlist";
import { Box } from "@chakra-ui/react";
import { useState } from "react";
import MovieActionsDialog from "./watched-actions-modal";
import { FaCircleCheck } from "react-icons/fa6";

export default function Watched({ item, watchlistId, isHovered } : { item: WatchlistItemInterface, watchlistId: string, isHovered: boolean }) {
    const [isSeen, setIsSeen] = useState(item.is_seen);
    async function updateWatchlistItem() {
        const response = await fetch(`/api/watchlists/default/movies/${item.tmdb_movie_id}`, {
            method: "POST",
            body: JSON.stringify({ is_seen: !item.is_seen, watchlistId }),
        });

        if (response.ok) {
            setIsSeen(!isSeen);
        }
    }

    return (
        <MovieActionsDialog>
            <Box 
                onClick={() => updateWatchlistItem()}
                opacity={isSeen || isHovered ? 1 : 0}
                transition="all 0.2s ease"
                cursor="pointer"
                transform={isHovered ? "scale(1.1)" : "scale(1)"}
                _hover={{
                    transform: "scale(1.2)",
                }}
            >
                {isSeen ? <FaCircleCheck color="green" /> : <FaCircleCheck color="green" />}

            </Box>
        </MovieActionsDialog>
    );

}