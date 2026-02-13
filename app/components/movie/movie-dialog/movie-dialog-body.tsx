import { Box, Text } from '@chakra-ui/react';
import { Section } from '~/components/layout/section';
import MovieProviders from '../movie-Providers';
import { useState } from 'react';
import Keywords from '../common/keywords';
import Credits from '../common/credit';
import { TmdbMovieDetailWAppendsProps } from '~/interfaces/tmdb/movie/detail';

// interface MovieDetailsProps {
//     details: TmdbMovieDetailWAppendsProps;
// }

const MovieDialogBody = ({ movieData } : {movieData: TmdbMovieDetailWAppendsProps | null}) => {
    console.log('MovieDialogBody movieData', movieData)
    const [region] = useState<string>('AU')
    if (!movieData) return null

    return (
        <Box display="flex" flexDirection="column" gap={8}>
            {
                movieData.keywords?.keywords?.length && (
                    <Section title="Keywords">
                        <Box as="section" display="flex" gap={2} mt={4} flexWrap="wrap">
                            <Keywords keywords={movieData?.keywords?.keywords || []} />
                        </Box>
                    </Section>
                )
            }
            <Section title="Cast">
                <Box display="flex" gap={1} flexWrap="wrap">
                    <Credits credits={movieData?.credits?.cast.slice(0, 30) || []}>
                        {(credit, index) => <Text _hover={{ color: 'orange.500'}} whiteSpace="nowrap">{credit.name}{index < 30 - 1 && ', '}</Text>}
                    </Credits>
                </Box>
            </Section>
            <Section title="Cast">
                <Box  display="flex" alignItems="center" gap={2}>
                    <Text>Director:</Text> 
                    <Credits credits={movieData?.credits?.crew.filter((i) => i.job === 'Director') || []} />
                </Box>
        
                <Box display="flex" alignItems="center" gap={2} mt={2}>
                    <Text>Original score:</Text>
                    <Credits credits={movieData?.credits?.crew.filter((i) => i.job === 'Original Music Composer') || []} />
                </Box>
            </Section>
            {
                movieData?.providers?.results[region] && (<MovieProviders providers={movieData?.providers?.results[region]} />)
            }
        </Box>
    );
};

export default MovieDialogBody;