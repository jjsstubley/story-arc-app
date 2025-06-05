import { Box, Heading } from "@chakra-ui/react"

import { EmblaCarousel } from "~/components/emblaCarousel";
import MoviePoster from "~/components/movie/poster";
import { MovieListsInterface } from "~/interfaces/movie-lists";


export default function DashboardLoggedIn({ movieLists }: {movieLists: MovieListsInterface[]}) {
  const [popularMovies, moviesNowPlaying, topRatedMovies, trendingMovies, trendingTv ] = movieLists

  const MovieListCategories = [
    {
      title: 'Popular Movies',
      data: popularMovies
    },
    {
      title: 'Trending Movies',
      data: trendingMovies
    },
    {
      title: 'Trending TV Shows',
      data: trendingTv
    },
    {
      title: 'Now Playing',
      data: moviesNowPlaying
    },
    {
      title: 'Top Rated Films',
      data: topRatedMovies
    }
  ]

  return (
    <>
        <Box as="section" display="grid" gap={2} gridColumn={1} flex="1" p={4} overflow="hidden">
          {
            MovieListCategories.map((list, index) => (
              <Box key={index }as="section" flex="1" p={4} pt={0} overflow="hidden">
                <Heading as="h3" pb={4}>{list.title}</Heading>
                <EmblaCarousel>
                  {
                    list.data.results.map((item, i) => (
                      <MoviePoster key={i} item={item}/>
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