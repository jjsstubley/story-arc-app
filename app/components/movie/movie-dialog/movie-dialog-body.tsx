import { Box, Text, Badge } from '@chakra-ui/react';
import { Link } from '@remix-run/react';
import { Section } from '~/components/layout/section';
import { TmdbMovieDetailInterface } from '~/interfaces/tmdb/tdmi-movie-detail';
import { slugify } from '~/utils/helpers';
import MovieProviders from '../movie-Providers';
import { useState } from 'react';

// interface MovieDetailsProps {
//     details: TmdbMovieDetailInterface;
// }

const MovieDialogBody = ({ movieData } : {movieData: TmdbMovieDetailInterface | null}) => {
    console.log('MovieDialogBody movieData', movieData)
    const [region] = useState<string>('AU')
    if (!movieData) return null

    return (
        <Box display="flex" flexDirection="column" gap={8}>
            {
                movieData.keywords?.keywords.length && (
                    <Section title="Keywords">
                        <Box as="section" display="flex" gap={2} mt={4} flexWrap="wrap">
                            {
                            movieData?.keywords?.keywords.map((item, index) => (
                                <Link to={`/tags/${slugify(item.name)}?id=${item.id}`} key={index}>
                                    <Badge size="md" colorPalette="red"> {item.name} </Badge>
                                </Link>
                            ))
                            }
                        </Box>
                    </Section>
                )
            }
            <Section title="Cast">
                <Box display="flex" gap={1} flexWrap="wrap">
                {
                    movieData?.credits?.cast.slice(0, 30).map((credit, index) => (
                        <Link key={index} to={`/credits/${slugify(credit.name)}_${credit.id}`}>
                            <Text _hover={{ color: 'orange.500'}} whiteSpace="nowrap">{credit.name}{index < 30 - 1 && ', '}</Text>
                        </Link>
                    ))
                }
                </Box>
            </Section>
            <Section title="Cast">
                <Box  display="flex" alignItems="center" gap={2}>
                    <Text>Director:</Text>  
                    {
                        movieData?.credits?.crew.filter((i) => i.job === 'Director').map((credit, index) => (
                        
                                <Link key={index} to={`/credits/${slugify(credit.name)}_${credit.id}`}>
                                    <Text _hover={{ color: 'orange.500'}} whiteSpace="nowrap">{credit.name},</Text>
                                </Link>
                            
                        ))
                    }
                </Box>
        
                <Box display="flex" alignItems="center" gap={2} mt={2}>
                    <Text>Original score:</Text>
                    {
                        movieData?.credits?.crew.filter((i) => i.job === 'Original Music Composer').map((credit, index) => (
                            
                            <Link key={index} to={`/credits/${slugify(credit.name)}_${credit.id}`}>
                                <Text _hover={{ color: 'orange.500'}} whiteSpace="nowrap">{credit.name}</Text>
                            </Link>
                            
                        ))
                    }
                </Box>
            </Section>
            {
                movieData?.providers?.results[region] && (<MovieProviders providers={movieData?.providers?.results[region]} />)
            }
        </Box>
    );
};

export default MovieDialogBody;