import { CollectionItemInterface } from "~/interfaces/collections";
import { Box, Spinner } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import MovieActionsDialog from "../user-actions/watchlist/watched-actions-modal";
import { FaCircleCheck } from "react-icons/fa6";
import { getMovieWatchedStatus, dispatchWatchedChange, useWatchedSync } from "../user-actions/watched/helpers";

/**
 * Uses user_watched_movies (GET/POST /api/movies/:movieId/watched). Not collection_items.is_watched.
 */
export default function CollectionWatched({ item, collectionId }: { item: CollectionItemInterface; collectionId: string; isHovered: boolean }) {
    const [watched, setWatched] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);

    useWatchedSync(item.movie_id, setWatched);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const status = await getMovieWatchedStatus(item.movie_id);
                if (!cancelled) setWatched(status.watched);
            } catch {
                if (!cancelled) setWatched(false);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [item.movie_id]);

    async function handleToggle(e: React.MouseEvent) {
        e.stopPropagation();
        if (watched === null) return;
        try {
            const response = await fetch(`/api/movies/${item.movie_id}/watched`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ watched: !watched }),
            });
            if (response.ok) {
                const data = await response.json();
                const newWatched = Boolean(data.watched);
                setWatched(newWatched);
                dispatchWatchedChange(item.movie_id, newWatched);
                setDialogOpen(newWatched);
            }
        } catch (err) {
            console.error("Failed to update watched", err);
        }
    }

    const movieTitle = item.movie?.title || `Movie ${item.movie_id}`;

    if (loading) {
        return (
            <Box display="flex" p={1} justifyContent="center" alignItems="center">
                <Spinner size="sm" />
            </Box>
        );
    }

    return (
        <MovieActionsDialog
            movieId={item.movie_id}
            movieTitle={movieTitle}
            isInWatchlist={true}
            open={dialogOpen}
            onOpenChange={(e) => setDialogOpen(e.open)}
        >
            <Box
                onClick={handleToggle}
                cursor="pointer"
                display="flex"
                p={1}
                rounded="md"
                textAlign="center"
                justifyContent="center"
                alignItems="center"
                color={watched ? "green.400" : "gray"}
            >
                <FaCircleCheck size={20} />
            </Box>
        </MovieActionsDialog>
    );
}

