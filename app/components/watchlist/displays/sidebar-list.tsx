"use client"

import MoviePosterList from "~/components/movie/previews/poster-list"
import { TmdbMovieSummaryInterface } from "~/interfaces/tmdb/movie/summary"
import { WatchlistInterface, WatchlistItemInterface } from "~/interfaces/watchlist"
// import BookmarkIcon from "~/components/user-actions/watchlist/displays/bookmark-icon";
import Watched from "~/components/user-actions/watchlist/watched"
import { MenuActions } from "~/components/ui/table/actions"
import { ReusableTable } from "~/components/ui/table/resuable-table"
import { useState } from "react"

export const SideBarWatchlist = ({ watchlist, inDialog=false, filter='all' }: {watchlist: WatchlistInterface, inDialog: boolean, filter: string }) => {
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const columns = [
    { key: "movie", header: "", width: 100, render: (item: WatchlistItemInterface) => <MoviePosterList item={item.movie as unknown as TmdbMovieSummaryInterface} inDialog={inDialog} /> },
    { key: "watched", header: "", width: 10, render: (item: WatchlistItemInterface) => <Watched item={item} watchlistId={watchlist.id} isHovered={hoveredItemId === item.id} /> },
    { key: "action", header: "", width: 10, render: (item: WatchlistItemInterface) => <MenuActions item={item} watchlistId={watchlist.id} isDefault={watchlist.is_default} inDialog={inDialog} /> },
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