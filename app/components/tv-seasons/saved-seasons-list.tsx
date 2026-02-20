"use client"

import { useEffect, useState } from "react";
import { SavedTVSeasonInterface } from "~/interfaces/tv-saved";
import TVSeasonPoster from "~/components/tv/seasons/previews/poster";
import { TVSeasonSummaryInterface } from "~/interfaces/tmdb/tv/season/summary";
import { Box, Text, VStack } from "@chakra-ui/react";

export default function SavedSeasonsList() {
  const [savedSeasons, setSavedSeasons] = useState<SavedTVSeasonInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSavedSeasons = async () => {
      try {
        const response = await fetch("/api/tv-seasons/saved");
        if (response.ok) {
          const data = await response.json();
          setSavedSeasons(data.savedSeasons || []);
        }
      } catch (error) {
        console.error("Failed to fetch saved TV seasons:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedSeasons();
  }, []);

  if (isLoading) {
    return <Text fontSize="sm" color="fg.muted">Loading saved TV seasons...</Text>;
  }

  if (savedSeasons.length === 0) {
    return (
      <Box>
        <Text fontSize="sm" color="fg.muted">No saved TV seasons yet.</Text>
      </Box>
    );
  }

  return (
    <VStack gap={4} align="stretch">
      {savedSeasons.map((saved) => (
        <Box key={saved.id}>
          <TVSeasonPoster 
            item={{ 
              id: saved.id,
              season_number: saved.season_number,
              name: `Season ${saved.season_number}`,
              air_date: saved.added_at,
              poster_path: "",
              overview: "",
              vote_average: 0
            } as TVSeasonSummaryInterface} 
            seriesId={saved.tmdb_series_id}
            includeTitle={true} 
          />
        </Box>
      ))}
    </VStack>
  );
}

