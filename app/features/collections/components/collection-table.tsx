import { Text } from "@chakra-ui/react";
import MoviePosterList from "~/components/movie/previews/poster-list";
import { ReusableTable } from "~/components/ui/table/resuable-table";
import { getFormattedDate } from "~/utils/helpers";
import type { CollectionItemWithMovie, CollectionWithMovies } from "../types";
import CollectionItemWatched from "./collection-item-watched";
import RemoveCollectionItemButton from "./remove-collection-item-button";

type Row = CollectionItemWithMovie & { id: number };

export default function CollectionTable({ collection, isOwner }: { collection: CollectionWithMovies; isOwner: boolean }) {
  // ReusableTable keys rows by `id`; a movie appears at most once per collection
  const rows: Row[] = collection.collection_items.map((item) => ({ ...item, id: item.movie_id }));

  const columns = [
    {
      key: "poster",
      header: "Name",
      width: 100,
      render: (item: Row) =>
        item.movie ? <MoviePosterList item={item.movie} /> : <Text fontSize="xs" color="fg.muted">Movie {item.movie_id}</Text>,
    },
    {
      key: "added_at",
      header: "Date added",
      width: 200,
      render: (item: Row) =>
        getFormattedDate({ release_date: item.added_at, options: { year: "numeric", month: "short", day: "numeric" }, region: "en-US" }),
    },
    { key: "watched", header: "Watched", width: 10, render: (item: Row) => <CollectionItemWatched item={item} /> },
    ...(isOwner
      ? [{
          key: "remove",
          header: "",
          width: 10,
          render: (item: Row) => (
            <RemoveCollectionItemButton
              collectionId={collection.id}
              movieId={item.movie_id}
              movieTitle={item.movie?.title ?? `Movie ${item.movie_id}`}
            />
          ),
        }]
      : []),
  ];

  if (rows.length === 0) {
    return <Text color="fg.muted" py={8} textAlign="center">This collection is empty.</Text>;
  }

  return <ReusableTable data={rows} columns={columns} />;
}
