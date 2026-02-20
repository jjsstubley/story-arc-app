import { WatchlistItemInterface } from "~/interfaces/watchlist";
import { Box } from "@chakra-ui/react";
import { useState } from "react";
import MovieActionsDialog from "./watched-actions-modal";
import { FaCircleCheck } from "react-icons/fa6";

export default function Watched({ item, watchlistId } : { item: WatchlistItemInterface, watchlistId: string, isHovered: boolean }) {
    const [isSeen, setIsSeen] = useState(item.is_seen);
    
    async function updateWatchlistItem(e: React.MouseEvent) {
        e.stopPropagation();
        
        // Determine the correct API endpoint based on watchlist ID
        const apiUrl = watchlistId === 'default' 
            ? `/api/watchlists/default/movies/${item.tmdb_movie_id}`
            : `/api/watchlists/${watchlistId}/movies/${item.tmdb_movie_id}`;
        
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ is_seen: !item.is_seen, watchlistId }),
        });

        if (response.ok) {
            setIsSeen(!isSeen);
        }
    }

    const movieTitle = item.movie?.title || item.series?.name || `Movie ${item.tmdb_movie_id}`;

    return (
        <MovieActionsDialog 
            movieId={item.tmdb_movie_id} 
            movieTitle={movieTitle}
            isInWatchlist={true}
        >
            <Box 
                onClick={updateWatchlistItem}
                cursor="pointer"
                display="flex"
                p={1}
                rounded="md"
                textAlign="center"
                justifyContent="center"
                alignItems="center"
            >
                <FaCircleCheck color={isSeen ? "green" : "gray"} size={20} />
            </Box>
        </MovieActionsDialog>
    );

}