"use client"

import MoviePosterList from "~/components/movie/previews/poster-list"
import { ReusableTable } from "~/components/ui/table/resuable-table"
import { TmdbMovieSummaryInterface } from "~/interfaces/tmdb/movie/summary"
// import BookmarkIcon from "~/components/user-actions/watchlist/displays/bookmark-icon"

export const Movielist = ({ items }: {items: TmdbMovieSummaryInterface[] }) => {

  const columns = [
    { key: "poster", header: "Movie", width: 100, render: (item: TmdbMovieSummaryInterface) => <MoviePosterList item={item} /> },
  ]

  return (
    <ReusableTable
      data={items}
      columns={columns}

    />
  )
}