import { Box } from "@chakra-ui/react";
import '~/styles.css'

import MovieOverlay from "./movie-overlay";
import { TmdbMovieDetailWAppendsProps } from "~/interfaces/tmdb/movie/detail";
import MediaImage from "~/components/media/common/movie-image";

const MovieHero = ({movie, height = '400px'} : {movie: TmdbMovieDetailWAppendsProps, height: string}) => {

    if (!movie) return (<Box width="100%" height={height} backgroundColor="gray.900" rounded="md"></Box>)
    return (
      <>
        <MediaImage backdrop_path={movie.backdrop_path} height={height} />
        <MovieOverlay movie={movie} />
      </>
    );
};

export default MovieHero;