// Public client-safe API of the collections feature. Import from "~/features/collections" only.
export { default as CollectionView } from "./components/collection-view";
export { collectionKeys, useCollection, useCreateCollection, useRemoveCollectionItem, useUpdateCollection } from "./queries";
export { MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH } from "./limits";
export type { Collection, CollectionItem, CollectionItemWithMovie, CollectionSummary, CollectionWithMovies } from "./types";
