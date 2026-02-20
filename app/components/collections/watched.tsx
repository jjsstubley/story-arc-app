import { CollectionItemInterface } from "~/interfaces/collections";
import { Box } from "@chakra-ui/react";
import { useState } from "react";
import MovieActionsDialog from "../user-actions/watchlist/watched-actions-modal";
import { FaCircleCheck } from "react-icons/fa6";

export default function CollectionWatched({ item, collectionId } : { item: CollectionItemInterface, collectionId: string, isHovered: boolean }) {
    const [isWatched, setIsWatched] = useState(item.is_watched || false);
    
    async function updateCollectionItem(e: React.MouseEvent) {
        e.stopPropagation();
        
        try {
            const response = await fetch(`/api/collections/${collectionId}/movies/${item.movie_id}/watched`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ is_watched: !item.is_watched }),
            });

            if (response.ok) {
                setIsWatched(!isWatched);
            } else {
                console.error("Failed to update collection item");
            }
        } catch (error) {
            console.error("Failed to update collection item", error);
        }
    }

    const movieTitle = item.movie?.title || `Movie ${item.movie_id}`;

    return (
        <MovieActionsDialog 
            movieId={item.movie_id} 
            movieTitle={movieTitle}
            isInWatchlist={true}
        >
            <Box 
                onClick={updateCollectionItem}
                cursor="pointer"
                display="flex"
                p={1}
                rounded="md"
                textAlign="center"
                justifyContent="center"
                alignItems="center"
            >
                <FaCircleCheck color={isWatched ? "green" : "gray"} size={20} />
            </Box>
        </MovieActionsDialog>
    );
}

