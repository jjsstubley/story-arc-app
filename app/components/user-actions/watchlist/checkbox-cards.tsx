import { VStack, Separator, Heading, Button } from "@chakra-ui/react"

import WatchListCheckboxCard from "./displays/checkbox-card";
import { useWatchlistContext } from "~/components/providers/watchlist-context";

export default function WatchListCheckboxCards({ movieId } : { movieId: number }) {
    const { isOtherWatchlistsOpen } = useWatchlistContext();

    return (
        <VStack align="start" gap={4}>
            <WatchListCheckboxCard watchlistId="popcorn" label="Popcorn List" description="A quick list of movies you&apos;re in the mood to watch — perfect for tonight&apos;s lineup." movieId={movieId} addon="Expires in 2 days" />
            <WatchListCheckboxCard watchlistId="default" label="Keep it for later" description="Default Watchlist" movieId={movieId} />
            {
                isOtherWatchlistsOpen && (
                    <>
                        <Separator orientation="horizontal" borderColor={"whiteAlpha.500"} width="100%"/>
                        <Heading fontSize="sm" fontWeight="bold">Add to other lists:</Heading>
                        { otherItems.map(({ title, value }) => (
                            <WatchListCheckboxCard key={value} watchlistId={value} label={title} description={title} movieId={movieId} />
                        ))}
                        <Button variant="solid" width="100%">
                            Create new list
                        </Button>
                    </>
                )
            }
        </VStack>
    );

}

const otherItems = [
    { title: "Sci-fi epics", value: "sci-fi-epics" },
    { title: "Horror classics", value: "horror-classics" },
]