

export const toggleWatchlist = async (watchlistId: string, movieId: number, selected: boolean) : Promise<boolean> => {
    console.log('toggleWatchlist', watchlistId, movieId, selected);
    try {
        const response = await fetch(`/api/watchlists/${watchlistId}/movies/${movieId}/toggle`, {
            method: selected && watchlistId === "popcorn" ? "DELETE" : "POST",
        });
        if (!response.ok) {
            console.error("Failed to update watchlist");
            return false;
        }
        return true;
    } catch (error) {
        console.error("Failed to update watchlist");
        return false;
    }
}


export const checkWatchlist = async (watchlistId: string, movieId: number) => {
    try {
        const response = await fetch(`/api/watchlists/${watchlistId}/movies/${movieId}`);

        if (response.ok) {
            console.log('response.ok');
            const data = await response.json();
            return data;
        }
    } catch (error) {
        console.error("Failed to check watchlist");
        return false;
    }
}