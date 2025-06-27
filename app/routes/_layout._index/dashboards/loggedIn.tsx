import { Box, Heading } from "@chakra-ui/react"
import CreditAvatar from "~/components/credit/credit-avatar";

import { EmblaCarousel } from "~/components/emblaCarousel";
import FeatureMovie from "~/components/movie/previews/feature";
import MovieFeaturette from "~/components/movie/previews/featurette";
import MoviePoster from "~/components/movie/previews/poster";
import { CollectionsInterface } from "~/interfaces/collections";
import { MovieListsInterface } from "~/interfaces/tmdb/movie-lists";
import { PeopleListsInterface, PersonKnownForInterface } from "~/interfaces/tmdb/people";
import { TmdbMovieInterface } from "~/interfaces/tmdb/tdmi-movie";


export default function DashboardLoggedIn({ movieLists, trendingPeople, collections }: {movieLists: MovieListsInterface[], trendingPeople: PeopleListsInterface, collections: CollectionsInterface[]}) {
  const [popularMovies, moviesNowPlaying, topRatedMovies, trendingMovies, trendingTv ] = movieLists

  const MovieListCategories = [
    {
      title: 'Popular Movies',
      data: popularMovies,
      feature: true,
      flex: "0 0 90%",
      options: {dragFree: false, loop: true, skipSnaps: true, },
      popularity: true
    },
    {
      title: 'Trending Movies',
      data: trendingMovies,
      flex: '0 0 200px'
    },
    {
      title: 'Trending TV Shows',
      data: trendingTv,
      flex: '0 0 200px'
    },
    {
      title: 'Trending Stars',
      data: trendingPeople,
      flex: '0 0 140px',
      avatar: true,
    },
    {
      title: 'Now Playing',
      data: moviesNowPlaying,
      featurette: true,
      flex: '0 0 300px',
    },
    {
      title: 'Top Rated Films',
      data: topRatedMovies,
      feature: true,
      flex: '0 0 33.33%',
      options: {dragFree: false, slidesToScroll: 2, skipSnaps: true}
    }
  ]

  return (
    <>
        <Box as="section" display="grid" gap={2} gridColumn={1} flex="1" p={4} overflow="hidden">
          {
            MovieListCategories.map((list, index) => (
              <Box key={index }as="section" flex="1" p={4} pt={0} overflow="hidden">
                <Heading as="h3" pb={4}>{list.title}</Heading>
                {
                  list.feature ? (
                    <EmblaCarousel flex={list.flex} options={list.options}>
                      {
                        list.data.results.map((item, i) => (
                          <FeatureMovie key={i} movie={item} displayPopularity={!(list.popularity)}/>
                        ))
                      }
                    </EmblaCarousel>
                  ): (
                    <EmblaCarousel flex={list.flex}>
                      {
                        list.data.results.map((item, i) => (
                          list.featurette ? (
                            <MovieFeaturette key={i} item={item as TmdbMovieInterface} />
                          ) : (
                            list.avatar ? (
                              <CreditAvatar key={i} item={item as PersonKnownForInterface}/>
                            ) : (
                              <MoviePoster key={i} item={item as TmdbMovieInterface}/>
                            )
                          )
    
                        ))
                      }
                    </EmblaCarousel>
                  )
                }
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
    </>
  );
}