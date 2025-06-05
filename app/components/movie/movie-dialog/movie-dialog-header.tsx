import { Box, CloseButton, Dialog,  IconButton } from '@chakra-ui/react';
import { TmdbMovieDetailInterface } from '~/interfaces/tdmi-movie-detail';
import MovieHero from '../movieHero';
import { LuExternalLink,  } from "react-icons/lu";
import { Link } from '@remix-run/react';

const MovieDialogHeader = ({details, error, loading} : { details: TmdbMovieDetailInterface | null, error: string | null, loading: boolean }) => {

    if (loading && !details) return (<Box height="300px" width="100%" display="flex" alignItems="center" justifyContent="center">loading....</Box>)
    if (error) return (<Box height="300px" width="100%" display="flex" alignItems="center" justifyContent="center">An error occured: {error}</Box>)
    return (
        <Box position="relative" flex={1} height="100%">
            { details && <MovieHero movie={details} height="400px" />}
            
            <Box position="absolute" right={14} top={2}>
                <Link to={`/movie/${details?.id}`}>
                    <IconButton aria-label="Search database" variant="ghost" size="sm" bg="blackAlpha.600" _hover={{bg:"blackAlpha.900"}}>
                        <LuExternalLink />
                    </IconButton>
                </Link>
            </Box>
            <Dialog.CloseTrigger asChild bg="blackAlpha.600" _hover={{bg:"blackAlpha.900"}}>
                <CloseButton size="sm" />
            </Dialog.CloseTrigger>
        </Box>
    );
};

export default MovieDialogHeader;