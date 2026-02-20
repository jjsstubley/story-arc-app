"use client"

import { useState } from "react";
import { SavedTVSeriesInterface } from "~/interfaces/tv-saved";
import { ReusableTable } from "~/components/ui/table/resuable-table";
import TVSeriesPosterList from "./tv-series-poster-list";
import DeleteSeriesAction from "./delete-series-action";
import { TmdbTVSeriesDetailWAppendsProps } from "~/interfaces/tmdb/tv/series/details";

interface SavedSeriesTableProps {
  savedSeries: (SavedTVSeriesInterface & { series?: TmdbTVSeriesDetailWAppendsProps })[];
  onDelete: () => void;
}

export default function SavedSeriesTable({ savedSeries, onDelete }: SavedSeriesTableProps) {
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  const columns = [
    { 
      key: "series", 
      header: "Series", 
      width: "100%", 
      render: (item: SavedTVSeriesInterface & { series?: TmdbTVSeriesDetailWAppendsProps }) => (
        <TVSeriesPosterList 
          item={item.series || { id: item.tmdb_series_id }} 
        />
      )
    },
    { 
      key: "action", 
      header: "", 
      width: 50, 
      render: (item: SavedTVSeriesInterface & { series?: TmdbTVSeriesDetailWAppendsProps }) => (
        <DeleteSeriesAction 
          seriesId={item.tmdb_series_id}
          seriesName={item.series?.name || `Series ${item.tmdb_series_id}`}
          onDelete={onDelete}
          isHovered={hoveredItemId === item.id}
        />
      )
    },
  ];

  return (
    <ReusableTable
      data={savedSeries}
      columns={columns}
      setHoveredItemId={setHoveredItemId}
    />
  );
}

