import { useWatchlistContext } from "../providers/watchlist-context";
import { SideBarWatchlist } from "./displays/sidebar-list";
import { useEffect, useState } from "react";
import { WatchlistInterface } from "~/interfaces/watchlist";
import EmptyWatchlist from "./empty-watchlist";

export default function PopcornWatchlist({watchlist: initialWatchlist}: {watchlist: WatchlistInterface | null}) {
  const { isWatchlistUpdated, resetUpdate } = useWatchlistContext();
  const [watchlist, setWatchlist] = useState<WatchlistInterface | null>(initialWatchlist);
  const isUpdated = isWatchlistUpdated('popcorn');

  const fetchWatchlist = async () => {
    const response = await fetch(`/api/watchlists/popcorn`);
    const data = await response.json();
    setWatchlist(data.watchlist);
  };
  // useEffect(() => {
  //   fetchWatchlist();
  // }, [])

  useEffect(() => {
    console.log('PopcornWatchlist isUpdated', isUpdated)
    if (isUpdated) {
      fetchWatchlist();
      resetUpdate('popcorn');
    }
  }, [isUpdated, resetUpdate]);

  useEffect(() => {
    fetchWatchlist();
  }, [])
   
  return (
    watchlist ? <SideBarWatchlist watchlist={watchlist} inDialog={true} filter='all' /> :  (
      <EmptyWatchlist title="The Popcorn List is empty" description="Add movies to your Popcorn List to get started." />   
    )
  )
}