"use client"

import { useEffect, useState } from "react";
import { SavedTVSeriesInterface } from "~/interfaces/tv-saved";
import { Box, Text } from "@chakra-ui/react";
import { useWatchlistContext } from "~/components/providers/watchlist-context";
import SavedSeriesTable from "./saved-series-table";
import { TmdbTVSeriesDetailWAppendsProps } from "~/interfaces/tmdb/tv/series/details";

export default function SavedSeriesList() {
  const [savedSeries, setSavedSeries] = useState<(SavedTVSeriesInterface & { series?: TmdbTVSeriesDetailWAppendsProps })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isWatchlistUpdated, resetUpdate } = useWatchlistContext();

  const fetchSavedSeries = async () => {
    try {
      const response = await fetch("/api/tv-series/saved");
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched saved series:', data.savedSeries);
        setSavedSeries(data.savedSeries || []);
      } else {
        console.error("Failed to fetch saved TV series:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Failed to fetch saved TV series:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedSeries();
  }, []);

  // Refresh when saved series is updated (using a generic update flag)
  useEffect(() => {
    if (isWatchlistUpdated('saved-tv-series')) {
      fetchSavedSeries();
      resetUpdate('saved-tv-series');
    }
  }, [isWatchlistUpdated, resetUpdate]);

  const handleDelete = () => {
    fetchSavedSeries();
  };

  if (isLoading) {
    return <Text fontSize="sm" color="fg.muted">Loading saved TV series...</Text>;
  }

  if (savedSeries.length === 0) {
    return (
      <Box>
        <Text fontSize="sm" color="fg.muted">No saved TV series yet.</Text>
      </Box>
    );
  }

  return (
    <SavedSeriesTable savedSeries={savedSeries} onDelete={handleDelete} />
  );
}

