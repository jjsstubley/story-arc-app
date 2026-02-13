import { Box, Card, Icon } from "@chakra-ui/react"

import { EmblaCarousel } from "~/components/emblaCarousel";

import MoviePoster from "~/components/movie/previews/poster";

import { TmdbMovieSummaryInterface } from "~/interfaces/tmdb/movie/summary";
import { TrendingMoviesInterface } from "~/interfaces/tmdb/trending";
import { PersonSummaryForInterface } from "~/interfaces/tmdb/people/summary";
import { MovieListsInterface } from "~/interfaces/tmdb/movie-lists";

import { TmdbTVSeriesSummaryInterface } from "~/interfaces/tmdb/tv/series/summary";
import { Link } from "@remix-run/react";

import { FaChartLine, FaClock, FaDollarSign, FaStar } from "react-icons/fa";
import { FaChartSimple } from "react-icons/fa6";
import { encodeValues } from "~/utils/helpers";
import { RequestFilterProps } from "~/components/search/filter-search";

type MediaInterface = TmdbMovieSummaryInterface | TmdbTVSeriesSummaryInterface | PersonSummaryForInterface

interface ResultsProps {
  popular: MovieListsInterface;
  recent: MovieListsInterface;
  highest_grossing: MovieListsInterface;
  highest_rated: MovieListsInterface;
  most_rated: MovieListsInterface;
}
interface FiltersProps {
  type: string,
  value: number
}
interface SearchListViewProps {
  results: ResultsProps;
  decodedFilters: FiltersProps[];   
}

export default function SearchListView({ results, decodedFilters }: SearchListViewProps) {

  const MovieListCategories = [
    {
        title: 'Most Popular',
        description: 'What is currently trending?',
        data: results.popular as TrendingMoviesInterface,
        color: 'orange.900/20',
        icon: FaChartLine,
        sortBy: 'popularity.desc',
        flex: '0 0 200px',
        content: (item: MediaInterface, index: number) => (
          <MoviePoster key={index} item={item as TmdbMovieSummaryInterface}/>  
        )
    },
    {
        title: 'Most Recent',
        description: 'What has come out recently?',
        data: results.recent as TrendingMoviesInterface,
        color: 'blue.900/20',
        icon: FaClock,
        sortBy: 'primary_release_date.desc',
        flex: '0 0 200px',
        content: (item: MediaInterface, index: number) => (
          <MoviePoster key={index} item={item as TmdbMovieSummaryInterface}/>  
        )
    },
    {
        title: 'Highest Grossing',
        description: 'Box office successes',
        data: results.highest_grossing as TrendingMoviesInterface,
        color: 'green.900/20',
        icon: FaDollarSign,
        sortBy: 'revenue.desc',
        flex: '0 0 200px',
        content: (item: MediaInterface, index: number) => (
          <MoviePoster key={index} item={item as TmdbMovieSummaryInterface}/>  
        )
    },
    {
        title: 'Highest Rated',
        description: 'Critically acclaimed films',
        data: results.highest_rated as TrendingMoviesInterface,
        color: 'yellow.900/20' ,
        icon: FaStar,
        sortBy: 'vote_average.desc',
        flex: '0 0 200px',
        content: (item: MediaInterface, index: number) => (
          <MoviePoster key={index} item={item as TmdbMovieSummaryInterface}/>  
        )
    },
    {
        title: 'Most Rated',
        description: 'Widely Reviewed',
        data: results.most_rated as TrendingMoviesInterface,
        color: 'purple.900/20',
        icon: FaChartSimple,
        sortBy: 'vote_count.desc',
        flex: '0 0 200px',
        content: (item: MediaInterface, index: number) => (
          <MoviePoster key={index} item={item as TmdbMovieSummaryInterface}/>  
        )
    },
  ]

  return (
    <Box overflow="auto" height="calc(100vh - 100px)">
        <Box as="section" display="grid" gap={4} gridColumn={1} flex="1" p={4} overflow="hidden">
          {
            MovieListCategories.map((list, index) => (
                <Card.Root key={index } as="section" flex="1" p={4} pt={0} overflow="hidden" bg={list.color}>
                    <Link to={`/search/results?filters=${encodeValues(decodedFilters as RequestFilterProps[])}&sort=${list.sortBy}`}>
                        <Card.Header _hover={{ cursor: "pointer", textDecoration: "underline" }}>
                            <Card.Title display="flex" alignItems="center" gap={2} fontSize="xl"><Icon as={list.icon} />{list.title}</Card.Title>
                            <Card.Description>{list.description}</Card.Description>
                        </Card.Header>
                    </Link> 
                    <Card.Body>
                        
                        <EmblaCarousel flex={list.flex}>
                        {
                            list.data.results.map((item, i) => (
                            list.content(item as MediaInterface, i)
                            ))
                        }
                        </EmblaCarousel>
                    </Card.Body>
                </Card.Root>
            ))
          }
        </Box>
    </Box>
  );
}