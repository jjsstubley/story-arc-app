import { Button, Skeleton } from "@chakra-ui/react";
import { FaCircleCheck } from "react-icons/fa6";
import { useMovieWatched, useSetMovieWatched } from "../queries";

interface MovieWatchedBadgeProps {
  movieId: number;
  fullWidth?: boolean;
  onMarkedAsWatched?: () => void;
}

/** Global watched toggle for a movie (user_watched_movies) */
export default function MovieWatchedBadge({ movieId, fullWidth, onMarkedAsWatched }: MovieWatchedBadgeProps) {
  const { data, isPending } = useMovieWatched(movieId);
  const setWatched = useSetMovieWatched(movieId);

  if (isPending) {
    return <Skeleton height="8" width={fullWidth ? "100%" : "36"} rounded="md" />;
  }

  // A failed load is treated as "not watched"; toggling will surface any real error
  const watched = data?.watched ?? false;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWatched.mutate(!watched, {
      onSuccess: (status) => {
        if (status.watched) onMarkedAsWatched?.();
      },
    });
  };

  return (
    <Button
      size="sm"
      variant={watched ? "solid" : "outline"}
      colorPalette={watched ? "green" : "gray"}
      color={watched ? "white" : undefined}
      width={fullWidth ? "100%" : undefined}
      onClick={handleToggle}
    >
      <FaCircleCheck /> {watched ? "Watched" : "Mark as watched"}
    </Button>
  );
}
