"use client"

import { useState } from "react"
import MoviePosterList from "~/components/movie/previews/poster-list"
import { DefaultActionBar } from "~/components/user-actions/action-bar"
import { ReusableTable } from "~/components/ui/table/resuable-table"
import { TmdbMovieSummaryInterface } from "~/interfaces/tmdb/movie/summary"
import { TVSeriesDetailsInterface } from "~/interfaces/tmdb/tv/series/details"
import { TVSeasonSummaryInterface } from "~/interfaces/tmdb/tv/season/summary"
import { getFormattedDate } from "~/utils/helpers"

export const TVSeriesTable = ({ series }: {series: TVSeriesDetailsInterface}) => {
  const [selection, setSelection] = useState<string[]>([])

  const columns = [
    { key: "poster", header: "Season", width: 100, render: (item: TVSeasonSummaryInterface) => <MoviePosterList item={item as unknown as TmdbMovieSummaryInterface} /> },
    // { key: "name", header: "Name", width: 200, render: (item: CollectionItemInterface) => item.movie.title },
    { key: "added_at", header: "Date added", width: 200, render: (item: TVSeasonSummaryInterface) => getFormattedDate({release_date: item.air_date, options: {year: 'numeric', month: 'long',day: 'numeric'}, region:'en-US'}) },
  ]

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
      />

      <DefaultActionBar selection={selection} />
    </>
  )
}
