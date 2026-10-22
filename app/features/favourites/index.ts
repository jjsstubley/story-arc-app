// Public client-safe API of the favourites feature. Import from "~/features/favourites" only.
export { default as FavouriteToggle } from "./components/favourite-toggle";
export { favouriteKeys, useFavourite, useSetFavourite } from "./queries";
export type { Favourite, FavouriteStatus } from "./types";
