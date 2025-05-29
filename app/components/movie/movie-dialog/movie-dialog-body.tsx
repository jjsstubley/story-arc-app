import { Box, Text, Badge } from '@chakra-ui/react';
import { Link } from '@remix-run/react';
import { Section } from '~/components/layout/section';
import { KeywordsInterface } from '~/interfaces/keywords';
import { MovieListsInterface } from '~/interfaces/movie-lists';
import { PeopleListInterface } from '~/interfaces/people';
import { WatchProvidersInterface } from '~/interfaces/provider';
import { ReviewListsInterface } from '~/interfaces/review';
import { TmdbMovieDetailInterface } from '~/interfaces/tdmi-movie-detail';
import { VideosInterface } from '~/interfaces/videos';
import { slugify } from '~/utils/helpers';
import MovieProviders from '../movie-Providers';
import { useState } from 'react';

interface MovieDetailsProps {
    details: TmdbMovieDetailInterface;
    similar: MovieListsInterface;
    reviews: ReviewListsInterface;
    keywords: KeywordsInterface;
    providers: WatchProvidersInterface;
    videos: VideosInterface;
    credits: PeopleListInterface;
}

const MovieDialogBody = ({ movieData } : {movieData: MovieDetailsProps | null}) => {
    console.log('MovieDialogBody movieData', movieData)
    const [region] = useState<string>('US')
    if (!movieData) return null

    return (
        <Box display="flex" flexDirection="column" gap={8}>
            {
                movieData.keywords.keywords.length && (
                    <Section title="Keywords">
                        <Box as="section" display="flex" gap={2} mt={4} flexWrap="wrap">
                            {
                            movieData.keywords.keywords.map((item, index) => (
                                <Link to={`/tag/${slugify(item.name)}?id=${item.id}`} key={index}>
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
                    movieData.credits.cast.map((credit, index) => (
                        <Link key={index} to={`/credit/${slugify(credit.name)}_${credit.id}`}>
                            <Text _hover={{ color: 'orange.500'}} whiteSpace="nowrap">{credit.name}{index < movieData.credits.cast.length - 1 && ', '}</Text>
                        </Link>
                    ))
                }
                </Box>
            </Section>
            <Section title="Cast">
                <Box>
                    {
                        movieData.credits.crew.filter((i) => i.job === 'Director').map((credit, index) => (
                            <Box key={index} display="flex" alignItems="center" gap={2}>
                                <Text>Director:</Text>  
                                <Link to={`/credit/${slugify(credit.name)}_${credit.id}`}>
                                    <Text _hover={{ color: 'orange.500'}} whiteSpace="nowrap">{credit.name}</Text>
                                </Link>
                            </Box>
                        ))
                    }
                </Box>
            </Section>
            {
                movieData.providers.results[region] && (<MovieProviders providers={movieData.providers.results[region]} />)
            }
        </Box>
    );
};

export default MovieDialogBody;