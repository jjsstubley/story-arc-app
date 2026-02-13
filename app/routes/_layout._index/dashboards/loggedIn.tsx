import { Box, Heading } from "@chakra-ui/react"
import CreditAvatar from "~/components/credit/credit-avatar";

import { EmblaCarousel } from "~/components/emblaCarousel";
import FeatureMovie from "~/components/movie/previews/feature";
import MovieFeaturette from "~/components/movie/previews/featurette";
import MoviePoster from "~/components/movie/previews/poster";
import { CollectionsInterface } from "~/interfaces/collections";
import { TmdbMovieSummaryInterface } from "~/interfaces/tmdb/movie/summary";
import { TrendingMoviesInterface, TrendingPeopleInterface, TrendingTVSeriesListsInterface } from "~/interfaces/tmdb/trending";
import { PersonSummaryForInterface } from "~/interfaces/tmdb/people/summary";
import { MovieListsInterface } from "~/interfaces/tmdb/movie-lists";
import TVSeriesPoster from "~/components/tv/series/previews/poster";
import { TmdbTVSeriesSummaryInterface } from "~/interfaces/tmdb/tv/series/summary";

type MediaInterface = TmdbMovieSummaryInterface | TmdbTVSeriesSummaryInterface | PersonSummaryForInterface

export default function DashboardLoggedIn({ movieLists, trendingPeople, collections }: {movieLists: (MovieListsInterface | TrendingMoviesInterface | TrendingTVSeriesListsInterface)[], trendingPeople: TrendingPeopleInterface, collections: CollectionsInterface[]}) {
  const [popularMovies, moviesNowPlaying, topRatedMovies, trendingMovies, trendingTv ] = movieLists

  const MovieListCategories = [
    {
      title: 'Popular Movies',
      data: popularMovies as MovieListsInterface,
      flex: "0 0 90%",
      options: {dragFree: false, loop: true, skipSnaps: true, },
      content: (item: MediaInterface, index: number) => (
        <FeatureMovie key={index} movie={item as TmdbMovieSummaryInterface} displayPopularity={true}/>
      )
    },
    {
      title: 'Trending Movies',
      data: trendingMovies as TrendingMoviesInterface,
      flex: '0 0 200px',
      content: (item: MediaInterface, index: number) => (
        <MoviePoster key={index} item={item as TmdbMovieSummaryInterface}/>  
      )
    },
    {
      title: 'Trending TV Shows',
      data: trendingTv as TrendingTVSeriesListsInterface,
      flex: '0 0 200px',  
      content: (item: MediaInterface, index: number) => (
        <TVSeriesPoster key={index} item={item as TmdbTVSeriesSummaryInterface}/> 
      )
    },
    {
      title: 'Trending Stars',
      data: trendingPeople as TrendingPeopleInterface,
      flex: '0 0 140px',
      content: (item: MediaInterface, index: number) => (
        <CreditAvatar key={index} item={item as PersonSummaryForInterface}/>
      )
    },
    {
      title: 'Now Playing',
      data: moviesNowPlaying as MovieListsInterface,
      flex: '0 0 300px',
      content: (item: MediaInterface, index: number) => (
        <MovieFeaturette key={index} item={item as TmdbMovieSummaryInterface} />
      )
    },
    {
      title: 'Top Rated Films',
      data: topRatedMovies as MovieListsInterface,
      flex: '0 0 33.33%',
      minW: '320px',
      options: {dragFree: false, slidesToScroll: 2, skipSnaps: true},
      content: (item: MediaInterface, index: number) => (
        <FeatureMovie key={index} movie={item as TmdbMovieSummaryInterface} displayPopularity={false}/>
      )
    }
  ]

  return (
    <Box overflow="auto" height="calc(100vh - 100px)">
        <Box as="section" display="grid" gap={2} gridColumn={1} flex="1" p={4} overflow="hidden">
          {
            MovieListCategories.map((list, index) => (
              <Box key={index } as="section" flex="1" p={4} pt={0} overflow="hidden">
                <Heading as="h3" pb={4}>{list.title}</Heading>
                <EmblaCarousel flex={list.flex} options={list.options} minW={list.minW}>
                  {
                    list.data.results.map((item, i) => (
                      list.content(item as MediaInterface, i)
                    ))
                  }
                </EmblaCarousel>
              </Box> 
            ))
          }
          {
            collections.map((collection, index) => (
              <Box key={index} as="section" flex="1" p={4} pt={0} overflow="hidden">
                <Heading as="h3" pb={4}>{collection.name}</Heading>
                <EmblaCarousel flex="0 0 200px">
                  {
                    collection.collection_items.map((item, i) => (
                      <MoviePoster key={i} item={item.movie}/>
                    ))
                  }
                </EmblaCarousel>
              </Box>
            ))
          }
        </Box>
    </Box>
  );
}