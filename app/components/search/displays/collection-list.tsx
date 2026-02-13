"use client"

import { ReusableTable } from "~/components/ui/table/resuable-table"
import { TmdbCollectionsInterface } from "~/interfaces/tmdb/tmdb-collections"
import CollectionPosterList from "~/components/collections/previews/poster-list"
// import BookmarkIcon from "~/components/user-actions/watchlist/displays/bookmark-icon"

export const Collectionlist = ({ items }: {items: TmdbCollectionsInterface[] }) => {

  const columns = [
    { key: "poster", header: "", width: 100, render: (item: TmdbCollectionsInterface) =>  <CollectionPosterList item={item} /> },
    { key: "name", header: "collection", width: 100, render: (item: TmdbCollectionsInterface) => item.name },
  ]

  return (
    <ReusableTable
      data={items}
      columns={columns}

    />
  )
}
