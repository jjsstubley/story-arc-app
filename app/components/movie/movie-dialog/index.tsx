import { useEffect, useState } from 'react';
import { TmdbMovieSummaryInterface } from '~/interfaces/tmdb/movie/summary';
import { TmdbMovieDetailWAppendsProps } from '~/interfaces/tmdb/movie/detail';

import { CustomDialog } from '../../custom-dialog';
import MovieDialogHeader from './movie-dialog-header';
import MovieDialogBody from './movie-dialog-body';

const MovieDialog = ({item, children} : { item: TmdbMovieSummaryInterface, children: React.ReactNode; }) => {
    const [open, setOpen] = useState(false);
    const [movieDetails, setMovieDetails] = useState<TmdbMovieDetailWAppendsProps | null>(null);
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