import { useEffect, useState } from 'react';
import { TmdbMovieInterface } from '~/interfaces/tdmi-movie';
import { TmdbMovieDetailInterface } from '~/interfaces/tdmi-movie-detail';
import { WatchProvidersInterface } from '~/interfaces/provider';

import { CustomDialog } from '../../custom-dialog';
import MovieDialogHeader from './movie-dialog-header';
import MovieDialogBody from './movie-dialog-body';
import { PeopleListInterface } from '~/interfaces/people';

const MovieDialog = ({item, children} : { item: TmdbMovieInterface, children: React.ReactNode; }) => {
    // const location = useLocation();
    const [open, setOpen] = useState(false);
    const [movieDetails, setMovieDetails] = useState<TmdbMovieDetailInterface | null>(null);
    const [movieProviders, setMovieProviders] = useState<WatchProvidersInterface | null>(null);
    const [credits, setCredits] = useState<PeopleListInterface | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function getMovieDetails() {
        setLoading(true);
        const res = await fetch(`/resources/movie/${item.id}`)
        const data = await res.json()

        console.log('getMovieDetails data', data)
        if (!res.ok) {
            setError(data.error)
        }

        setMovieDetails(data.movieDetails)
        setMovieProviders(data.providers)
        setCredits(data.credits)
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
            header={ <MovieDialogHeader movie={movieDetails} error={error} loading={loading}/>}
            body={ <MovieDialogBody providers={movieProviders} credits={credits}/>}
        />
    );
};

export default MovieDialog;