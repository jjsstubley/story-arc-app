"use client";

import { Box, Button, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { getMovieWatchedStatus, dispatchWatchedChange, useWatchedSync } from "./helpers";

interface MovieWatchedBadgeProps {
  movieId: number;
  fullWidth?: boolean;
  onMarkedAsWatched?: () => void;
}

/**
 * Uses user_watched_movies (GET/POST /api/movies/:movieId/watched).
 */
export default function MovieWatchedBadge({ movieId, fullWidth, onMarkedAsWatched }: MovieWatchedBadgeProps) {
  const [watched, setWatched] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useWatchedSync(movieId, setWatched);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const status = await getMovieWatchedStatus(movieId);
        if (!cancelled) setWatched(status.watched);
      } catch {
        if (!cancelled) setWatched(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [movieId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setToggling(true);
    try {
      const response = await fetch(`/api/movies/${movieId}/watched`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watched: !watched }),
      });
      if (response.ok) {
        const data = await response.json();
        const newWatched = Boolean(data.watched);
        setWatched(newWatched);
        dispatchWatchedChange(movieId, newWatched);
        if (newWatched) onMarkedAsWatched?.();
      }
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" width={fullWidth ? "100%" : undefined}>
        <Spinner size="sm" />
      </Box>
    );
  }

  return (
    <Button
      size="sm"
      variant={watched ? "solid" : "outline"}
      colorPalette={watched ? "green" : "gray"}
      color={watched ? "white" : undefined}
      width={fullWidth ? "100%" : undefined}
      onClick={handleToggle}
      disabled={toggling}
    >
      <FaCircleCheck /> {toggling ? "..." : watched ? "Watched" : "Mark as watched"}
    </Button>
  );
}
