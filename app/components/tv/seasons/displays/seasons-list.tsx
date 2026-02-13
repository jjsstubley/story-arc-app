"use client"

import { ReusableTable } from "~/components/ui/table/resuable-table"
import { TVSeasonSummaryInterface } from "~/interfaces/tmdb/tv/season/summary"
import TVSeasonPosterList from "../previews/poster-list"

export const SeasonPosterlist = ({ items, seriesId }: {items: TVSeasonSummaryInterface[], seriesId: number }) => {

  const columns = [
    { key: "poster", header: "", width: 100, render: (item: TVSeasonSummaryInterface) => <TVSeasonPosterList item={item} seriesId={seriesId} /> },
  ]

  return (
    <ReusableTable
      data={items}
      columns={columns}

    />
  )
}