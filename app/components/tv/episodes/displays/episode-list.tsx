"use client"

import { ReusableTable } from "~/components/ui/table/resuable-table"
import { TVEpisodeSummaryInterface } from "~/interfaces/tmdb/tv/episode/summary"
import TVEpisodePosterList from "../previews/poster-list"

export const EpisodePosterlist = ({ items, seriesId }: {items: TVEpisodeSummaryInterface[], seriesId: number }) => {

  const columns = [
    { key: "poster", header: "", width: 100, render: (item: TVEpisodeSummaryInterface) => <TVEpisodePosterList item={item} seriesId={seriesId} /> },
  ]

  return (
    <ReusableTable
      data={items}
      columns={columns}

    />
  )
}