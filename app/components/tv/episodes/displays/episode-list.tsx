"use client";

import { Box } from "@chakra-ui/react";
import EpisodeWatchedCell from "~/components/user-actions/watched/episode-watched-cell";
import { ReusableTable } from "~/components/ui/table/resuable-table";
import TVEpisodePosterList from "~/components/tv/episodes/previews/poster-list";
import { TVEpisodeSummaryInterface } from "~/interfaces/tmdb/tv/episode/summary";

interface EpisodePosterlistProps {
  items: TVEpisodeSummaryInterface[];
  seriesId: number;
  seasonNumber: number;
  watchedEpisodeNumbers?: number[];
  onWatchedChange?: (episodeNumber: number, watched: boolean) => void;
}

export const EpisodePosterlist = ({
  items,
  seriesId,
  seasonNumber,
  watchedEpisodeNumbers = [],
  onWatchedChange,
}: EpisodePosterlistProps) => {
  const columns = [
    {
      key: "poster",
      header: "",
      width: 100,
      render: (item: TVEpisodeSummaryInterface) => (
        <TVEpisodePosterList item={item} seriesId={seriesId} />
      ),
    },
    {
      key: "watched",
      header: "Watched",
      width: 56,
      render: (item: TVEpisodeSummaryInterface) => (
        <Box onClick={(e) => e.stopPropagation()}>
          <EpisodeWatchedCell
            seriesId={seriesId}
            seasonNumber={seasonNumber}
            episodeNumber={item.episode_number}
            initialWatched={watchedEpisodeNumbers.includes(item.episode_number)}
            onWatchedChange={onWatchedChange}
          />
        </Box>
      ),
    },
  ];

  return <ReusableTable data={items} columns={columns} />;
};