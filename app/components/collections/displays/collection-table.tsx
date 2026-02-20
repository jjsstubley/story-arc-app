"use client"

import { useState } from "react"
import { CollectionItemInterface, CollectionsInterface } from "~/interfaces/collections"
import { ReusableTable } from "~/components/ui/table/resuable-table"
import { TmdbMovieSummaryInterface } from "~/interfaces/tmdb/movie/summary"
import { getFormattedDate } from "~/utils/helpers"
import CollectionWatched from "~/components/collections/watched"
import MoviePosterList from "~/components/movie/previews/poster-list"
import DeleteCollectionItemAction from "~/components/collections/delete-movie-action"

export const CollectionTable = ({ collection }: {collection: CollectionsInterface}) => {
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null)

  const columns = [
    { 
      key: "poster", 
      header: "Name", 
      width: 100, 
      render: (item: CollectionItemInterface) => (
        <MoviePosterList item={item.movie as unknown as TmdbMovieSummaryInterface} />
      )
    },
    { 
      key: "collection", 
      header: "Collection", 
      width: 200, 
      render: () => collection.name 
    },
    { 
      key: "added_at", 
      header: "Date added", 
      width: 200, 
      render: (item: CollectionItemInterface) => (
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
      render: (item: CollectionItemInterface) => (
        <CollectionWatched 
          item={item} 
          collectionId={collection.id} 
          isHovered={hoveredItemId === item.list_id} 
        />
      )
    }
  ]

  return (
    <ReusableTable
      data={collection.collection_items}
      columns={columns}
      setHoveredItemId={setHoveredItemId}
    />
  )
}
