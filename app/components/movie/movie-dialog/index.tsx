import { useEffect, useState } from 'react';
import { TmdbMovieInterface } from '~/interfaces/tdmi-movie';
import { TmdbMovieDetailInterface } from '~/interfaces/tdmi-movie-detail';
import { WatchProvidersInterface } from '~/interfaces/provider';

import { CustomDialog } from '../../custom-dialog';
import MovieDialogHeader from './movie-dialog-header';
import MovieDialogBody from './movie-dialog-body';
import { PeopleListInterface } from '~/interfaces/people';
import { KeywordsInterface } from '~/interfaces/keywords';
import { MovieListsInterface } from '~/interfaces/movie-lists';
import { ReviewListsInterface } from '~/interfaces/review';
import { VideosInterface } from '~/interfaces/videos';

interface MovieDetailsProps {
    details: TmdbMovieDetailInterface;
    similar: MovieListsInterface;
    reviews: ReviewListsInterface;
    keywords: KeywordsInterface;
    providers: WatchProvidersInterface;
    videos: VideosInterface;
    credits: PeopleListInterface;
}

const MovieDialog = ({item, children} : { item: TmdbMovieInterface, children: React.ReactNode; }) => {
    // const location = useLocation();
    const [open, setOpen] = useState(false);
    const [movieData, setMovieData] = useState<MovieDetailsProps | null>(null);
    const [movieDetails, setMovieDetails] = useState<TmdbMovieDetailInterface | null>(null);
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

        setMovieData(data)
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
            body={ <MovieDialogBody movieData={ movieData } />}
        />
    );
};

export default MovieDialog;