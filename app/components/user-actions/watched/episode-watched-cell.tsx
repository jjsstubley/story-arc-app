"use client";

import { Box, Spinner } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FaCircleCheck } from "react-icons/fa6";

const API_BASE = "/api/tv/series";

async function getEpisodeWatchedStatus(
  seriesId: number,
  seasonNumber: number,
  episodeNumber: number
): Promise<{ watched: boolean }> {
  const res = await fetch(
    `${API_BASE}/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}/watched`
  );
  if (!res.ok) return { watched: false };
  const data = await res.json();
  return { watched: Boolean(data.watched) };
}

interface EpisodeWatchedCellProps {
  seriesId: number;
  seasonNumber: number;
  episodeNumber: number;
  initialWatched?: boolean;
  onWatchedChange?: (episodeNumber: number, watched: boolean) => void;
}

/**
 * Uses user_watched_tv_episodes (GET/POST .../episode/:episodeNumber/watched).
 */
export default function EpisodeWatchedCell({
  seriesId,
  seasonNumber,
  episodeNumber,
  initialWatched = false,
  onWatchedChange,
}: EpisodeWatchedCellProps) {
  const [watched, setWatched] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const status = await getEpisodeWatchedStatus(
          seriesId,
          seasonNumber,
          episodeNumber
        );
        if (!cancelled) setWatched(status.watched);
      } catch {
        if (!cancelled) setWatched(initialWatched);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [seriesId, seasonNumber, episodeNumber, initialWatched]);

  async function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (watched === null || toggling) return;
    setToggling(true);
    try {
      const res = await fetch(
        `${API_BASE}/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}/watched`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ watched: !watched }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const newWatched = Boolean(data.watched);
        setWatched(newWatched);
        onWatchedChange?.(episodeNumber, newWatched);
      }
    } catch (err) {
      console.error("Failed to update episode watched", err);
    } finally {
      setToggling(false);
    }
  }

  if (loading) {
    return (
      <Box
        display="flex"
        p={1}
        justifyContent="center"
        alignItems="center"
        onClick={(e) => e.stopPropagation()}
      >
        <Spinner size="sm" />
      </Box>
    );
  }

  return (
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
      opacity={toggling ? 0.6 : 1}
    >
      <FaCircleCheck size={20} />
    </Box>
  );
}
