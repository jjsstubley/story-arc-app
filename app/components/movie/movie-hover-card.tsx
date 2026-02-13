import { Box, Image, Strong, Text } from '@chakra-ui/react';
import { TmdbMovieSummaryInterface } from '~/interfaces/tmdb/movie/summary';
import { getFormattedDate } from '~/utils/helpers';

const MovieHoverCard = ({item} : { item: TmdbMovieSummaryInterface }) => {

    return (
        <Box display="flex">
            <Image
            src={`https://image.tmdb.org/t/p/w300/${item.poster_path}`}
            alt="Backdrop"
            width="100px"
            height="100%"
            objectFit="cover"
            

        />
            <Box p={4}>
                <Strong>{item.title}</Strong> 
                <Box position="relative" width="100%" my={2}>
                    <Box position="absolute"  top="0" left="0" zIndex={1} bg="orange.400" height="8px" rounded="md" width={`${(parseFloat(item.vote_average.toString()) / 10) * 100}%`}></Box>
                    <Box bg="gray.200" height="8px" rounded="md" width="100%"></Box>
                </Box>
                <Text>{parseFloat(item.vote_average.toString()).toFixed(1)} / 10</Text>
                <Text mt={4}>Released { getFormattedDate({release_date: item.release_date, options: {year: 'numeric', month: 'long',day: 'numeric'}, region:'en-US'}) }</Text>
            </Box>
        </Box>
    );
};

export default MovieHoverCard;