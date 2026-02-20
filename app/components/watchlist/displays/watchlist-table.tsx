"use client"

import { useState } from "react"
import MoviePosterList from "~/components/movie/previews/poster-list"
import { TmdbMovieSummaryInterface } from "~/interfaces/tmdb/movie/summary"
import { WatchlistInterface, WatchlistItemInterface } from "~/interfaces/watchlist"
import { ReusableTable } from "~/components/ui/table/resuable-table"
import { getFormattedDate } from "~/utils/helpers"
import Watched from "~/components/user-actions/watchlist/watched"
import DeleteMovieAction from "~/components/watchlist/delete-movie-action"
import EmptyWatchlist from "~/components/watchlist/empty-watchlist"

export const WatchlistTable = ({ watchlist }: {watchlist: WatchlistInterface}) => {
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null)

  const columns = [
    { 
      key: "poster", 
      header: "Name", 
      width: 100, 
      render: (item: WatchlistItemInterface) => (
        <MoviePosterList item={item.movie as unknown as TmdbMovieSummaryInterface} />
      )
    },
    { 
      key: "watchlist", 
      header: "Watchlist", 
      width: 200, 
      render: () => watchlist.name 
    },
    { 
      key: "added_at", 
      header: "Date added", 
      width: 200, 
      render: (item: WatchlistItemInterface) => (
        <div className="line-clamp-1">
          {getFormattedDate({
            release_date: item.added_at, 
            options: {year: 'numeric', month: 'short', day: 'numeric'}, 
            region: 'en-US'
          })}
        </div>
      )
    },
    { 
      key: "watched", 
      header: "Watched", 
      width: 10, 
      render: (item: WatchlistItemInterface) => (
        <Watched 
          item={item} 
          watchlistId={watchlist.id} 
          isHovered={hoveredItemId === item.id} 
        />
      )
    },
    { 
      key: "action", 
      header: "", 
      width: 50, 
      render: (item: WatchlistItemInterface) => (
        <DeleteMovieAction 
          movieId={item.movie.id}
          movieTitle={item.movie.title || `Movie ${item.tmdb_movie_id}`}
          watchlistId={watchlist.id}
          isDefault={watchlist.is_default}
          onDelete={() => {}}
          isHovered={hoveredItemId === item.id}
        />
      )
    },
  ]

  // Handle empty watchlist
  if (!watchlist.watchlist_items || watchlist.watchlist_items.length === 0) {
    // Determine appropriate message based on watchlist type
    let title = "This watchlist is empty";
    let description = "Add some movies to get started!";
    
    if (watchlist.id === "default") {
      title = "The Default List is empty";
      description = "Add movies to your Default List to get started.";
    } else if (watchlist.id === "popcorn") {
      title = "The Popcorn List is empty";
      description = "Add movies to your Popcorn List to get started.";
    }

    return <EmptyWatchlist title={title} description={description} />
  }

  return (
    <ReusableTable
      data={watchlist.watchlist_items}
      columns={columns}
      setHoveredItemId={setHoveredItemId}
    />
  )
}
