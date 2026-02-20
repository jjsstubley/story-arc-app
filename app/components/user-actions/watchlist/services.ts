

export const toggleWatchlist = async (watchlistId: string, movieId: number, selected: boolean, mediaType: string = 'movie') : Promise<boolean> => {
    console.log('toggleWatchlist', watchlistId, movieId, selected, mediaType);
    try {
        const response = await fetch(`/api/watchlists/${watchlistId}/movies/${movieId}/toggle`, {
            method: selected && watchlistId === "popcorn" ? "DELETE" : "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ media_type: mediaType })
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

// TV Series functions
export const toggleTVSeries = async (seriesId: number, selected: boolean): Promise<boolean> => {
    console.log('toggleTVSeries', seriesId, selected);
    try {
        const response = await fetch(`/api/tv-series/${seriesId}/toggle`, {
            method: selected ? "DELETE" : "POST",
        });
        if (!response.ok) {
            console.error("Failed to update TV series");
            return false;
        }
        return true;
    } catch (error) {
        console.error("Failed to update TV series");
        return false;
    }
}

export const checkTVSeries = async (seriesId: number) => {
    try {
        const response = await fetch(`/api/tv-series/${seriesId}/toggle`, {
            method: "GET",
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        }
    } catch (error) {
        console.error("Failed to check TV series");
        return { exists: false };
    }
    return { exists: false };
}

// TV Season functions
export const toggleTVSeason = async (seriesId: number, seasonNumber: number, selected: boolean): Promise<boolean> => {
    console.log('toggleTVSeason', seriesId, seasonNumber, selected);
    try {
        const response = await fetch(`/api/tv-seasons/${seriesId}/${seasonNumber}/toggle`, {
            method: selected ? "DELETE" : "POST",
        });
        if (!response.ok) {
            console.error("Failed to update TV season");
            return false;
        }
        return true;
    } catch (error) {
        console.error("Failed to update TV season");
        return false;
    }
}

export const checkTVSeason = async (seriesId: number, seasonNumber: number) => {
    try {
        const response = await fetch(`/api/tv-seasons/${seriesId}/${seasonNumber}/toggle`, {
            method: "GET",
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        }
    } catch (error) {
        console.error("Failed to check TV season");
        return { exists: false };
    }
    return { exists: false };
}

// TV Episode functions
export const toggleTVEpisode = async (seriesId: number, seasonNumber: number, episodeNumber: number, selected: boolean): Promise<boolean> => {
    console.log('toggleTVEpisode', seriesId, seasonNumber, episodeNumber, selected);
    try {
        const response = await fetch(`/api/tv-episodes/${seriesId}/${seasonNumber}/${episodeNumber}/toggle`, {
            method: selected ? "DELETE" : "POST",
        });
        if (!response.ok) {
            console.error("Failed to update TV episode");
            return false;
        }
        return true;
    } catch (error) {
        console.error("Failed to update TV episode");
        return false;
    }
}

export const checkTVEpisode = async (seriesId: number, seasonNumber: number, episodeNumber: number) => {
    try {
        const response = await fetch(`/api/tv-episodes/${seriesId}/${seasonNumber}/${episodeNumber}/toggle`, {
            method: "GET",
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        }
    } catch (error) {
        console.error("Failed to check TV episode");
        return { exists: false };
    }
    return { exists: false };
}