import { Box, Heading, SimpleGrid } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { TmdbMovieInterface } from "~/interfaces/tmdb/tdmi-movie";
// import WatchlistMovie from "./watchlist-movie";
import MoviePosterList from "../movie/previews/poster-list";


export default function SideTempWatchlist() {
    const [tempWatchlist, setTempWatchlist] = useState<TmdbMovieInterface[]>([]);
    
    async function fetchTempWatchlist() {
        const response = await fetch(`/api/watchlists/popcorn`);

        const data = await response.json();
        console.log('fetchTempWatchlist data', data)

        setTempWatchlist(data.movies || []);
    }

    useEffect(() => { 
        fetchTempWatchlist()

        const handler = () => fetchTempWatchlist();
        window.addEventListener("popcorn-list-updated", handler);
        return () => window.removeEventListener("popcorn-list-updated", handler);
    }, [])

    return (
        <Box p={4}>
            <Heading as="h3" size="md" mb={4}>Popcorn List</Heading>
            <SimpleGrid gap={4}>
                {
                    tempWatchlist.map((item: TmdbMovieInterface, index: number) => (<MoviePosterList key={index} item={item} />))
                }
            </SimpleGrid>
        </Box>
    )
}