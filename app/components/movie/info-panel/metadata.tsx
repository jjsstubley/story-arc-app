"use client";

import { Badge, Box, Text } from "@chakra-ui/react";
import { useState } from "react";
import { getFormattedDate, getMovieTags } from "~/utils/helpers";
import ArkHeader from "~/components/ui/ark-header";
import Genres from "../common/genres";
import { TmdbMovieDetailWAppendsProps } from "~/interfaces/tmdb/movie/detail";
import MovieWatchedBadge from "~/components/user-actions/watched/movie-watched-badge";
import MovieActionsDialog from "~/components/user-actions/watchlist/watched-actions-modal";

const InfoPanelMetadata = ({ movie }: { movie: TmdbMovieDetailWAppendsProps }) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <>
            <Box display="flex" justifyContent="space-between" gap={4} alignItems="flex-start" width="100%">
                <Box flex={1}>
                    <ArkHeader as="h1" fontSize="lg">
                        {movie.title} <Text fontSize="xs" color="whiteAlpha.600" whiteSpace="nowrap">{getFormattedDate({ release_date: movie.release_date, options: { year: 'numeric', month: 'long', day: 'numeric' }, region: 'en-US' })} | {movie.runtime} mins</Text>
                    </ArkHeader>
                </Box>
            </Box>
            <Box display="flex" gap={2} mt={4} flexWrap="wrap">
                <Genres genres={movie.genres} />
            </Box>
            <Box display="flex" gap={2} alignItems="center" justifyContent="flex-start">
                {
                    getMovieTags(movie, { minimumVotes: 100, globalAverageRating: 6.8 }).map((tag, index) => (
                        <Badge key={index} size="md" colorPalette="red" mt={4}> {tag} </Badge>
                    ))
                }
            </Box>
            <Box mt={4} width="100%">
                <MovieWatchedBadge movieId={movie.id} fullWidth onMarkedAsWatched={() => setDialogOpen(true)} />
            </Box>
            <MovieActionsDialog
                movieId={movie.id}
                movieTitle={movie.title ?? ""}
                isInWatchlist={true}
                open={dialogOpen}
                onOpenChange={(e) => setDialogOpen(e.open)}
            >
                <Box display="none" />
            </MovieActionsDialog>
        </>
    );
};

export default InfoPanelMetadata;