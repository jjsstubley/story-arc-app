"use client"

import { useState } from "react"
import MoviePosterList from "~/components/movie/previews/poster-list"
import { TmdbMovieSummaryInterface } from "~/interfaces/tmdb/movie/summary"
import { WatchlistInterface, WatchlistItemInterface } from "~/interfaces/watchlist"
import { DefaultActionBar } from "~/components/user-actions/action-bar"

import { ReusableTable } from "~/components/ui/table/resuable-table"

export const WatchlistTable = ({ watchlist }: {watchlist: WatchlistInterface}) => {
  const [selection, setSelection] = useState<string[]>([])

  const columns = [
    { key: "poster", header: "Name", width: 100, render: (item: WatchlistItemInterface) => <MoviePosterList item={item.movie as unknown as TmdbMovieSummaryInterface} /> },
    { key: "watchlist", header: "Watchlist", width: 200, render: () => watchlist.name },
    { key: "added_at", header: "Date added", width: 200, render: (item: WatchlistItemInterface) => item.added_at },
  ]

  return (
    <>
      <ReusableTable
        data={watchlist.watchlist_items}
        columns={columns}
        selection={{
          selectedIds: selection,
          onSelectionChange: setSelection,
          getId: (item: WatchlistItemInterface) => item.id,
        }}    
      />

      <DefaultActionBar selection={selection} />
    </>
  )
}
