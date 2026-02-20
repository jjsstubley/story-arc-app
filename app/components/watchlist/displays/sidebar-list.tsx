"use client"

import MoviePosterList from "~/components/movie/previews/poster-list"
import { TmdbMovieSummaryInterface } from "~/interfaces/tmdb/movie/summary"
import { WatchlistInterface, WatchlistItemInterface } from "~/interfaces/watchlist"
// import BookmarkIcon from "~/components/user-actions/watchlist/displays/bookmark-icon";
import Watched from "~/components/user-actions/watchlist/watched"
import { ReusableTable } from "~/components/ui/table/resuable-table"
import DeleteMovieAction from "../delete-movie-action"
import { useState } from "react"

export const SideBarWatchlist = ({ watchlist, inDialog=false, filter='all', onDelete }: {watchlist: WatchlistInterface, inDialog: boolean, filter: string, onDelete?: () => void }) => {
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const columns = [
    { key: "movie", header: "", width: 100, render: (item: WatchlistItemInterface) => <MoviePosterList item={item.movie as unknown as TmdbMovieSummaryInterface} inDialog={inDialog} /> },
    { key: "watched", header: "", width: 10, render: (item: WatchlistItemInterface) => <Watched item={item} watchlistId={watchlist.id} isHovered={hoveredItemId === item.id} /> },
    { 
      key: "action", 
      header: "", 
      width: 50, 
      render: (item: WatchlistItemInterface) => (
        <DeleteMovieAction 
          movieId={item.movie.id}
          movieTitle={item.movie.title}
          watchlistId={watchlist.id}
          isDefault={watchlist.is_default}
          onDelete={onDelete || (() => {})}
          isHovered={hoveredItemId === item.id}
        />
      )
    },
  ]

  return (
    <>
      <ReusableTable
        data={watchlist.watchlist_items.filter((item: WatchlistItemInterface) => { return filter === 'all' ? true : item.media_type === filter })}
        columns={columns}
        setHoveredItemId={setHoveredItemId}
      />
    </>
  )
}