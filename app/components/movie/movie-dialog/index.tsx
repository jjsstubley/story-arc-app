import { useEffect, useState } from 'react';
import { TmdbMovieInterface } from '~/interfaces/tmdb/tdmi-movie';
import { TmdbMovieDetailInterface } from '~/interfaces/tmdb/tdmi-movie-detail';

import { CustomDialog } from '../../custom-dialog';
import MovieDialogHeader from './movie-dialog-header';
import MovieDialogBody from './movie-dialog-body';

const MovieDialog = ({item, children} : { item: TmdbMovieInterface, children: React.ReactNode; }) => {
    const [open, setOpen] = useState(false);
    const [movieDetails, setMovieDetails] = useState<TmdbMovieDetailInterface | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function getMovieDetails() {
        setLoading(true);
        const res = await fetch(`/api/movie/${item.id}`)
        const data = await res.json()

        if (!res.ok) {
            setError(data.error)
        }

        setMovieDetails(data.movieDetails)
        setLoading(false)
    }

    useEffect(() => {
        if (open) {
            getMovieDetails()
        }
      }, [open]);

    return (
        <CustomDialog 
            dialogProps={{
                open: open,
                onOpenChange: (e) => setOpen(e.open),
                size: 'cover',
                placement: "center",
                motionPreset: 'slide-in-bottom',
                scrollBehavior: 'outside',
            }}
            trigger={ children }
            header={ <MovieDialogHeader details={movieDetails} error={error} loading={loading} /> }
            body={ <MovieDialogBody movieData={movieDetails} />}
        />
    );
};

export default MovieDialog;