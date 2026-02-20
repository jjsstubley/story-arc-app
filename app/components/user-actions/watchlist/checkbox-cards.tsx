import { VStack, Separator, Heading, Button } from "@chakra-ui/react"
import { useEffect, useState } from "react";

import WatchListCheckboxCard from "./displays/checkbox-card";
import CreateWatchlistDialog from "./create-watchlist-dialog";

interface Watchlist {
    id: string;
    name: string;
    descriptions: string | null;
    is_default: boolean;
}

export default function WatchListCheckboxCards({ movieId } : { movieId: number }) {
    const [userWatchlists, setUserWatchlists] = useState<Watchlist[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchWatchlists = async () => {
            try {
                const response = await fetch("/api/watchlists");
                if (response.ok) {
                    const data = await response.json();
                    // Filter out default watchlist and popcorn (they're shown separately)
                    const filtered = (data.watchlist || []).filter((w: Watchlist) => 
                        !w.is_default && w.id !== "popcorn"
                    );
                    setUserWatchlists(filtered);
                }
            } catch (error) {
                console.error("Failed to fetch watchlists:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWatchlists();
    }, []);

    return (
        <VStack align="start" gap={4}>
            <WatchListCheckboxCard watchlistId="popcorn" label="Popcorn List" description="A quick list of movies you&apos;re in the mood to watch — perfect for tonight&apos;s lineup." movieId={movieId} addon="Expires in 2 days" />
            <WatchListCheckboxCard watchlistId="default" label="Keep it for later" description="Default Watchlist" movieId={movieId} />
            <Separator orientation="horizontal" borderColor={"whiteAlpha.500"} width="100%"/>
            <Heading fontSize="sm" fontWeight="bold">Add to other lists:</Heading>
            { !isLoading && userWatchlists.map((watchlist) => (
                <WatchListCheckboxCard 
                    key={watchlist.id} 
                    watchlistId={watchlist.id} 
                    label={watchlist.name} 
                    description={watchlist.descriptions || watchlist.name} 
                    movieId={movieId} 
                />
            ))}
            <CreateWatchlistDialog movieId={movieId} trigger={
                <Button variant="solid" width="100%">
                    Create new list
                </Button>
            } />
        </VStack>
    );

}