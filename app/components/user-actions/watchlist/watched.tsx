import { WatchlistItemInterface } from "~/interfaces/watchlist";
import { Box, IconButton } from "@chakra-ui/react";
import { useState } from "react";
import MovieActionsDialog from "./watched-actions-modal";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

export default function Watched({ item, watchlistId } : { item: WatchlistItemInterface, watchlistId: string, isHovered: boolean }) {
    const [isSeen, setIsSeen] = useState(item.is_seen);
    const [dialogOpen, setDialogOpen] = useState(false);

    async function updateWatchlistItem(e: React.MouseEvent) {
        e.stopPropagation();

        const currentIsSeen = isSeen;
        const willBeWatched = !currentIsSeen;

        const apiUrl = watchlistId === 'default'
            ? `/api/watchlists/default/movies/${item.tmdb_movie_id}`
            : `/api/watchlists/${watchlistId}/movies/${item.tmdb_movie_id}`;

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_seen: !currentIsSeen, watchlistId }),
        });

        if (response.ok) {
            setIsSeen(!currentIsSeen);
            if (willBeWatched) setDialogOpen(true);
            else setDialogOpen(false);
        }
    }

    const movieTitle = item.movie?.title || item.series?.name || `Movie ${item.tmdb_movie_id}`;

    return (
        <>
            <IconButton
                variant="ghost"
                size="sm"
                aria-label={isSeen ? "Mark as not seen" : "Mark as seen"}
                onClick={updateWatchlistItem}
                color={isSeen ? "green.400" : "whiteAlpha.500"}
                _hover={{
                    color: isSeen ? "green.300" : "whiteAlpha.700",
                    transform: "scale(1.1)",
                }}
                transition="color 0.15s ease, transform 0.15s ease"
            >
                {isSeen ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
            </IconButton>
            <MovieActionsDialog
                movieId={item.tmdb_movie_id}
                movieTitle={movieTitle}
                isInWatchlist={true}
                open={dialogOpen}
                onOpenChange={(e) => setDialogOpen(e.open)}
            >
                <Box display="none" />
            </MovieActionsDialog>
        </>
    );
}