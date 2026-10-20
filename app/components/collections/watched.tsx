import { CollectionItemInterface } from "~/interfaces/collections";
import { Box, Skeleton } from "@chakra-ui/react";
import { useState } from "react";
import MovieActionsDialog from "../user-actions/watchlist/watched-actions-modal";
import { FaCircleCheck } from "react-icons/fa6";
import { useMovieWatched, useSetMovieWatched } from "~/features/watched";

/**
 * Uses the global watched state (user_watched_movies), not collection_items.is_watched.
 */
export default function CollectionWatched({ item }: { item: CollectionItemInterface; collectionId: string; isHovered: boolean }) {
    const { data, isPending } = useMovieWatched(item.movie_id);
    const setWatched = useSetMovieWatched(item.movie_id);
    const [dialogOpen, setDialogOpen] = useState(false);

    const watched = data?.watched ?? false;
    const movieTitle = item.movie?.title || `Movie ${item.movie_id}`;

    function handleToggle(e: React.MouseEvent) {
        e.stopPropagation();
        const next = !watched;
        setWatched.mutate(next, { onSuccess: () => setDialogOpen(next) });
    }

    if (isPending) {
        return (
            <Box display="flex" p={1} justifyContent="center" alignItems="center">
                <Skeleton boxSize="5" rounded="full" />
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
