"use client"

import { useEffect, useState } from "react";
import { SavedTVEpisodeInterface } from "~/interfaces/tv-saved";
import TVEpisodePoster from "~/components/tv/episodes/previews/poster";
import { TVEpisodeSummaryInterface } from "~/interfaces/tmdb/tv/episode/summary";
import { Box, Text, VStack } from "@chakra-ui/react";

export default function SavedEpisodesList() {
  const [savedEpisodes, setSavedEpisodes] = useState<SavedTVEpisodeInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSavedEpisodes = async () => {
      try {
        const response = await fetch("/api/tv-episodes/saved");
        if (response.ok) {
          const data = await response.json();
          setSavedEpisodes(data.savedEpisodes || []);
        }
      } catch (error) {
        console.error("Failed to fetch saved TV episodes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedEpisodes();
  }, []);

  if (isLoading) {
    return <Text fontSize="sm" color="fg.muted">Loading saved TV episodes...</Text>;
  }

  if (savedEpisodes.length === 0) {
    return (
      <Box>
        <Text fontSize="sm" color="fg.muted">No saved TV episodes yet.</Text>
      </Box>
    );
  }

  return (
    <VStack gap={4} align="stretch">
      {savedEpisodes.map((saved) => (
        <Box key={saved.id}>
          <TVEpisodePoster 
            item={{ 
              id: saved.id,
              episode_number: saved.episode_number,
              season_number: saved.season_number,
              name: `Episode ${saved.episode_number}`,
              air_date: saved.added_at,
              still_path: "",
              overview: "",
              vote_average: 0,
              vote_count: 0,
              production_code: "",
              runtime: 0,
              show_id: saved.tmdb_series_id
            } as TVEpisodeSummaryInterface} 
            seriesId={saved.tmdb_series_id}
            includeTitle={true} 
          />
        </Box>
      ))}
    </VStack>
  );
}

