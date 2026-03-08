"use client";

import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import { Box, Text } from "@chakra-ui/react";
import { FaCircleCheck } from "react-icons/fa6";
import TVSeasonPosterList from "~/components/tv/seasons/previews/poster-list";
import { DefaultActionBar } from "~/components/user-actions/action-bar";
import { ReusableTable } from "~/components/ui/table/resuable-table";
import { TVSeriesDetailsInterface } from "~/interfaces/tmdb/tv/series/details";
import { TVSeasonSummaryInterface } from "~/interfaces/tmdb/tv/season/summary";
import { getFormattedDate } from "~/utils/helpers";

export const TVSeriesTable = ({
  series,
  watchedBySeason = {},
  seasonCompleted = {},
}: {
  series: TVSeriesDetailsInterface;
  watchedBySeason?: Record<number, number[]>;
  seasonCompleted?: Record<number, boolean>;
}) => {
  const [selection, setSelection] = useState<string[]>([]);
  const navigate = useNavigate();

  if (!series) {
    return null;
  }

  const columns = [
    {
      key: "poster",
      header: "Season",
      width: 100,
      render: (item: TVSeasonSummaryInterface) => (
        <Box onClick={(e) => e.stopPropagation()}>
          <TVSeasonPosterList item={item} seriesId={series.id} />
        </Box>
      ),
    },
    {
      key: "name",
      header: "Name",
      width: 200,
      render: (item: TVSeasonSummaryInterface) => item.name,
    },
    {
      key: "added_at",
      header: "Date added",
      width: 200,
      render: (item: TVSeasonSummaryInterface) =>
        getFormattedDate({
          release_date: item.air_date,
          options: {
            year: "numeric",
            month: "long",
            day: "numeric",
          },
          region: "en-US",
        }),
    },
    {
      key: "completed",
      header: "Completed",
      width: 140,
      render: (item: TVSeasonSummaryInterface) => {
        const completed = seasonCompleted[item.season_number];
        const watchedCount =
          watchedBySeason[item.season_number]?.length ?? 0;
        const total = item.episode_count ?? 0;
        return (
          <Box
            onClick={(e) => e.stopPropagation()}
            display="flex"
            alignItems="center"
            gap={2}
            color={completed ? "green.400" : "whiteAlpha.700"}
          >
            {completed ? (
              <>
                <FaCircleCheck size={18} />
                <Text fontSize="sm">Completed</Text>
              </>
            ) : total > 0 ? (
              <Text fontSize="sm">
                {watchedCount}/{total}
              </Text>
            ) : null}
          </Box>
        );
      },
    },
  ];

  return (
    <>
      <ReusableTable
        data={series.seasons}
        columns={columns}
        selection={{
          selectedIds: selection,
          onSelectionChange: setSelection,
          getId: (item: TVSeasonSummaryInterface) => item.id.toString(),
        }}
        onRowClick={(item: TVSeasonSummaryInterface) =>
          navigate(`/tv/series/${series.id}/season/${item.season_number}`)
        }
      />

      <DefaultActionBar selection={selection} />
    </>
  );
};
