import { SideBarWatchlist } from "./displays/sidebar-list";
import { useEffect, useState } from "react";
import { WatchlistInterface, WatchlistItemInterface } from "~/interfaces/watchlist";
import { useWatchlistContext } from "../providers/watchlist-context";
import EmptyWatchlist from "./empty-watchlist";


export default function DefaultWatchlist({filter='all'}: {filter: string}) {
  const { isWatchlistUpdated, resetUpdate } = useWatchlistContext();
  const [watchlist, setWatchlist] = useState<WatchlistInterface | null>(null);

  const fetchWatchlist = async () => {
    const response = await fetch(`/api/watchlists/default`);
    const data = await response.json();
    console.log('data', data.watchlist);
    data.watchlist = { ...data.watchlist, watchlist_items: data.watchlist.watchlist_items.map((item: WatchlistItemInterface) => { return { ...item, media_type: 'movie' }})};
    // const sortedWatchlist = watchlistWMediaType.sort((a: WatchlistItemInterface, b: WatchlistItemInterface) => a.movie.title.localeCompare(b.movie.title));  
    console.log('data.watchlist', data.watchlist);
    setWatchlist(data.watchlist);
  };
  useEffect(() => {
    if (isWatchlistUpdated('default')) {
      fetchWatchlist();
      resetUpdate('default');
    }
  }, [isWatchlistUpdated, resetUpdate])

  useEffect(() => {
    fetchWatchlist();
  }, [])

  const handleDelete = () => {
    fetchWatchlist();
  }
   
  return (
    watchlist ? <SideBarWatchlist watchlist={watchlist} inDialog={false} filter={filter} onDelete={handleDelete} /> : (
      <EmptyWatchlist title="The Default List is empty" description="Add movies to your Default List to get started." />   
    )
  )
}