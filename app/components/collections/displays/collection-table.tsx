"use client"

import { useState } from "react"
import MoviePosterList from "~/components/movie/previews/poster-list"
import { CollectionItemInterface, CollectionsInterface } from "~/interfaces/collections"
import { DefaultActionBar } from "~/components/user-actions/action-bar"
import { ReusableTable } from "~/components/ui/table/resuable-table"
import { TmdbMovieSummaryInterface } from "~/interfaces/tmdb/movie/summary"
import { getFormattedDate } from "~/utils/helpers"
import CollectionWatched from "~/components/collections/watched"

export const CollectionTable = ({ collection }: {collection: CollectionsInterface}) => {
  const [selection, setSelection] = useState<string[]>([])
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null)

  const columns = [
    { key: "poster", header: "Movie",  render: (item: CollectionItemInterface) => <MoviePosterList item={item.movie as unknown as TmdbMovieSummaryInterface} /> },
    { key: "watched", header: "", width: 10, render: (item: CollectionItemInterface) => <CollectionWatched item={item} collectionId={collection.id} isHovered={hoveredItemId === item.list_id} /> },
    // { key: "name", header: "Name", width: 200, render: (item: CollectionItemInterface) => item.movie.title },
    // { key: "collection", header: "Collection", width: 200, render: () => collection.name },
    { key: "added_at", header: "Date added", render: (item: CollectionItemInterface) => <div className="line-clamp-1">{getFormattedDate({release_date: item.added_at, options: {year: "numeric", month: "long", day: "numeric"}, region: "en-US" })}</div> },
  ]

  return (
    <>
      <ReusableTable
        data={collection.collection_items}
        columns={columns}
        selection={{
          selectedIds: selection,
          onSelectionChange: setSelection,
          getId: (item: CollectionItemInterface) => item.list_id,
        }}
        setHoveredItemId={setHoveredItemId}
      />

      <DefaultActionBar selection={selection} />
    </>
  )
}
