import { Text,  IconButton, Portal, Popover, VStack, CheckboxCard, Separator, Heading, Button } from "@chakra-ui/react"
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { useEffect, useState } from "react";

export default function WatchListDropdown({ movieId} : { movieId: number }) {
    // const [isAddedToWatchlist, setIsAddedToWatchlist] = useState<boolean>(false);
    const [selectedLists, setSelectedLists] = useState<string[]>([]);
    const isInAnyList = selectedLists.length > 0;
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isOtherWatchlistsOpen, setIsOtherWatchlistsOpen] = useState(false);

    const isInTempList = selectedLists.includes("temporary");
    
    const toggleList = (value:string, openOtherLists:boolean=false) => {
        if(openOtherLists) {
            setIsOtherWatchlistsOpen((prev) =>  !prev);
        }
        setSelectedLists((prev) =>
          prev.includes(value)
            ? prev.filter((v) => v !== value)
            : [...prev, value]
        );
    };

    const updateTempList = async () => {
        toggleList('temporary'); // Toggle the temporary list state
      
        const response = await fetch(`/api/watchlists/popcorn/movies/${movieId}/toggle`, {
          method: isInTempList? "DELETE" : "POST",
        });
        if (!response.ok) {
            console.error("Failed to update temporary watchlist");
            toggleList('temporary');
            return;
        }
        window.dispatchEvent(new Event("popcorn-list-updated"));
    };

    const updateDefaultList = async () => {

        toggleList('default', true); // Toggle the temporary list state
      
        const res = await fetch(`/api/watchlists/default/movies/${movieId}/toggle`, { 
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        })

        console.log('res', res.json())

        if (!res.ok) {
            console.error("Failed to update watchlist");
            toggleList('default', true);
            return;
        }

        window.dispatchEvent(new Event("default-list-updated"));
    };

    const checkTempWatchlist = async () => { 
        const response = await fetch(`/api/watchlists/popcorn/movies/${movieId}`);
        
        if (response.ok) {
            const data = await response.json();
            if( data.exists && !data.expired) { 
                setSelectedLists((prev) => [...prev, 'temporary']);
            }
        }
    }

    const checkWatchlist = async () => { 
        const response = await fetch(`/api/watchlists/default/movies/${movieId}`);
        
        if (response.ok) {
            const data = await response.json();
            if(data.exists) { 
                setSelectedLists((prev) => [...prev, 'default']);
            }
        }
    }

    useEffect(() => {
        checkTempWatchlist();
        checkWatchlist()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
                            <VStack align="start" gap={4}>
                                <CheckboxCard.Root size="sm"  width="100%" onCheckedChange={updateTempList} onClick={(e) => e.stopPropagation()} checked={isInTempList}>
                                    <CheckboxCard.HiddenInput />
                                    <CheckboxCard.Control>
                                        <CheckboxCard.Content>
                                            <CheckboxCard.Label>Popcorn List</CheckboxCard.Label>
                                            <CheckboxCard.Description>A quick list of movies you&apos;re in the mood to watch — perfect for tonight&apos;s lineup.</CheckboxCard.Description>
                                        </CheckboxCard.Content>
                                        <CheckboxCard.Indicator />
                                    </CheckboxCard.Control>
                                    <CheckboxCard.Addon>
                                        Expires in 2 days
                                    </CheckboxCard.Addon>
                                </CheckboxCard.Root>
                                <CheckboxCard.Root size="sm"  width="100%" onCheckedChange={updateDefaultList} onClick={(e) => e.stopPropagation()} checked={selectedLists.includes('default')}>
                                    <CheckboxCard.HiddenInput />
                                    <CheckboxCard.Control>
                                        <CheckboxCard.Content>
                                            <CheckboxCard.Label>Keep it for later</CheckboxCard.Label>
                                            <CheckboxCard.Description>Default Watchlist</CheckboxCard.Description>
                                        </CheckboxCard.Content>
                                        <CheckboxCard.Indicator />
                                    </CheckboxCard.Control>
                                </CheckboxCard.Root>
                                {
                                    isOtherWatchlistsOpen && (
                                        <>
                                            <Separator orientation="horizontal" borderColor={"whiteAlpha.500"} width="100%"/>
                                            <Heading fontSize="sm" fontWeight="bold">Add to other lists:</Heading>
                                            { otherItems.map(({ title, value }) => (
                        
                                                <CheckboxCard.Root size="sm" key={value} width="100%" onCheckedChange={() => toggleList(value)} onClick={(e) => e.stopPropagation()} checked={selectedLists.includes(value)}>
                                                    <CheckboxCard.HiddenInput />
                                                    <CheckboxCard.Control>
                                                        <CheckboxCard.Content>
                                                            <CheckboxCard.Label>{title}</CheckboxCard.Label>
                                                        </CheckboxCard.Content>
                                                        <CheckboxCard.Indicator />
                                                    </CheckboxCard.Control>
                                                </CheckboxCard.Root>
                                            ))}
                                            <Button variant="solid" width="100%">
                                                Create new list
                                            </Button>
                                        </>
                                    )
                                }
                            </VStack>
                        </Popover.Body>
                    </Popover.Content>
                </Popover.Positioner>
            </Portal>
        </Popover.Root>
    );

}

const otherItems = [
    { title: "Sci-fi epics", value: "sci-fi-epics" },
    { title: "Horror classics", value: "horror-classics" },
]