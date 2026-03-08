import { Box } from "@chakra-ui/react";
import { useState, useCallback } from "react";

import { EpisodePosterlist } from "~/components/tv/episodes/displays/episode-list";
import FixedSeasonHeader from "~/components/tv/seasons/fixed-season-header";
import SeasonHero from "~/components/tv/seasons/hero";
import { TVSeasonDetailsInterface } from "~/interfaces/tmdb/tv/season/details";
import { TVSeriesDetailsInterface } from "~/interfaces/tmdb/tv/series/details";
import { usePosterGradientColor } from "~/hooks/use-poster-gradient-color";

export default function SeasonDashboard({
  series,
  season,
  watchedEpisodeNumbers: initialWatched,
}: {
  series: Pick<TVSeriesDetailsInterface, "id" | "name">;
  season: TVSeasonDetailsInterface;
  watchedEpisodeNumbers: number[];
}) {
  const [watchedEpisodeNumbers, setWatchedEpisodeNumbers] = useState<
    number[]
  >(initialWatched);

  const handleWatchedChange = useCallback(
    (episodeNumber: number, watched: boolean) => {
      setWatchedEpisodeNumbers((prev) =>
        watched
          ? prev.includes(episodeNumber)
            ? prev
            : [...prev, episodeNumber].sort((a, b) => a - b)
          : prev.filter((n) => n !== episodeNumber)
      );
    },
    []
  );

  const gradientColor = usePosterGradientColor(
    season?.id,
    season?.poster_path,
    season?.id?.toString()
  );

  const sortedEpisodes = [...(season.episodes ?? [])].sort(
    (a, b) => a.episode_number - b.episode_number
  );
  const totalEpisodes = sortedEpisodes.length;

  return (
    <Box position="relative" flex={1} overflow="auto" height="calc(100vh - 100px)">
      {season && (
        <FixedSeasonHeader
          season={season}
          seriesName={series?.name}
          seriesId={series?.id}
          gradientColor={gradientColor}
          watchedCount={watchedEpisodeNumbers.length}
          totalEpisodes={totalEpisodes}
        />
      )}
      <Box width="100%" top={10} zIndex={10}>
        <SeasonHero
          season={season}
          height="300px"
          watchedCount={watchedEpisodeNumbers.length}
          totalEpisodes={totalEpisodes}
        />
      </Box>
      <Box
        as="section"
        display="grid"
        gap={12}
        gridColumn={1}
        flex="1"
        overflow="hidden"
        pt={12}
        px={8}
      >
        <EpisodePosterlist
          items={sortedEpisodes}
          seriesId={series.id}
          seasonNumber={season.season_number}
          watchedEpisodeNumbers={watchedEpisodeNumbers}
          onWatchedChange={handleWatchedChange}
        />
      </Box>
    </Box>
  );
}
