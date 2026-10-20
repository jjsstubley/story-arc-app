import { WatchlistItemInterface } from "~/interfaces/watchlist";
import { Box, IconButton } from "@chakra-ui/react";
import { useState } from "react";
import MovieActionsDialog from "./watched-actions-modal";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { useMovieWatched, useSetMovieWatched } from "~/features/watched";
import { notifyError } from "~/shared/ui/notify";

interface WatchedProps {
    item: WatchlistItemInterface;
    watchlistId: string;
    isHovered: boolean;
}

/**
 * Seen toggle for a watchlist row. Movies use the global watched state, so the
 * row, info panel and collections always agree. TV items still use `is_seen`.
 */
export default function Watched({ item, watchlistId }: WatchedProps) {
    return item.media_type === "tv"
        ? <SeriesSeenToggle item={item} watchlistId={watchlistId} />
        : <MovieSeenToggle item={item} watchlistId={watchlistId} />;
}

function MovieSeenToggle({ item, watchlistId }: Omit<WatchedProps, "isHovered">) {
    const movieId = item.tmdb_movie_id ?? item.tmdb_id;
    // Server lists carry the global state in is_seen; the cookie-based popcorn list doesn't
    const { data } = useMovieWatched(movieId, {
        initialWatched: watchlistId === "popcorn" ? undefined : item.is_seen,
    });
    const setWatched = useSetMovieWatched(movieId);
    const [dialogOpen, setDialogOpen] = useState(false);
    const isSeen = data?.watched ?? false;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const next = !isSeen;
        setWatched.mutate(next, { onSuccess: () => setDialogOpen(next) });
    };

    return (
        <SeenButton
            isSeen={isSeen}
            onClick={handleClick}
            movieId={movieId}
            title={item.movie?.title || `Movie ${movieId}`}
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
        />
    );
}

function SeriesSeenToggle({ item, watchlistId }: Omit<WatchedProps, "isHovered">) {
    const [isSeen, setIsSeen] = useState(item.is_seen);
    const [dialogOpen, setDialogOpen] = useState(false);

    async function handleClick(e: React.MouseEvent) {
        e.stopPropagation();
        const next = !isSeen;
        const apiUrl = watchlistId === 'default'
            ? `/api/watchlists/default/movies/${item.tmdb_movie_id}`
            : `/api/watchlists/${watchlistId}/movies/${item.tmdb_movie_id}`;

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_seen: next, watchlistId }),
            });
            if (!response.ok) throw new Error(`Request failed (${response.status})`);
            setIsSeen(next);
            setDialogOpen(next);
        } catch (error) {
            notifyError("Couldn't update watched", error);
        }
    }

    return (
        <SeenButton
            isSeen={isSeen}
            onClick={handleClick}
            movieId={item.tmdb_movie_id}
            title={item.series?.name || `Series ${item.tmdb_movie_id}`}
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
        />
    );
}

function SeenButton({ isSeen, onClick, movieId, title, dialogOpen, setDialogOpen }: {
    isSeen: boolean;
    onClick: (e: React.MouseEvent) => void;
    movieId: number;
    title: string;
    dialogOpen: boolean;
    setDialogOpen: (open: boolean) => void;
}) {
    return (
        <>
            <IconButton
                variant="ghost"
                size="sm"
                aria-label={isSeen ? "Mark as not seen" : "Mark as seen"}
                onClick={onClick}
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
                movieId={movieId}
                movieTitle={title}
                isInWatchlist={true}
                open={dialogOpen}
                onOpenChange={(e) => setDialogOpen(e.open)}
            >
                <Box display="none" />
            </MovieActionsDialog>
        </>
    );
}
