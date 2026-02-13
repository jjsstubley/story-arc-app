import { Text,  IconButton, Portal, Popover } from "@chakra-ui/react"
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { useCallback, useState } from "react";
import WatchListCheckboxCards from "./checkbox-cards";

export default function WatchListDropdown({ movieId} : { movieId: number }) {
    // const [isAddedToWatchlist, setIsAddedToWatchlist] = useState<boolean>(false);
    const [isInAnyList, setIsInAnyList] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const updateIsInAnyList = useCallback((inAnyList: boolean) => {
        setIsInAnyList(inAnyList);
    }, []);

    // Only render the child when the function is ready
    if (typeof updateIsInAnyList !== 'function') {
        return <div>Loading...</div>;
    }

    return (
        <Popover.Root
            // open={isPopoverOpen}
            // onOpenChange={() => setDefaultList('watchlist')} // Removed function as not needed
            onFocusOutside={() => setIsPopoverOpen(false)}
            positioning={{ placement: "bottom-end" }}
        >
            <Popover.Trigger asChild>
                <IconButton variant="subtle" border="1px solid" borderColor={"whiteAlpha.300"} rounded="full" onClick={(e) => {
                    e.stopPropagation();
                    setIsPopoverOpen(!isPopoverOpen)
                }}>
                    {isInAnyList ? (<Text color="gold"><IoBookmark size={28}/></Text>) : (<><IoBookmarkOutline size={28} /></> )}
                </IconButton>
            </Popover.Trigger>
            <Portal>
                <Popover.Positioner>
                    <Popover.Content overflow="auto">
                        {/* <Popover.Header>Select Lists:</Popover.Header> */}
                        <Popover.Body>
                            <WatchListCheckboxCards movieId={movieId} />
                        </Popover.Body>
                    </Popover.Content>
                </Popover.Positioner>
            </Portal>
        </Popover.Root>
    );

}