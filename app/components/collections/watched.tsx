import { CollectionItemInterface } from "~/interfaces/collections";
import { Box } from "@chakra-ui/react";
import { useState } from "react";
import MovieActionsDialog from "../user-actions/watchlist/watched-actions-modal";
import { FaCircleCheck } from "react-icons/fa6";

export default function CollectionWatched({ item, collectionId, isHovered } : { item: CollectionItemInterface, collectionId: string, isHovered: boolean }) {
    const [isWatched, setIsWatched] = useState(item.is_watched || false);
    
    async function updateCollectionItem() {
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

    return (
        <MovieActionsDialog>
            <Box 
                onClick={() => updateCollectionItem()}
                opacity={isWatched || isHovered ? 1 : 0}
                transition="all 0.2s ease"
                cursor="pointer"
                transform={isHovered ? "scale(1.1)" : "scale(1)"}
                _hover={{
                    transform: "scale(1.2)",
                }}
            >
                {isWatched ? <FaCircleCheck color="green" /> : <FaCircleCheck color="green" />}
            </Box>
        </MovieActionsDialog>
    );
}

