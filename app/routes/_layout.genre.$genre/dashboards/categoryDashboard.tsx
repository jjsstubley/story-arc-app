import { Box, Heading, SimpleGrid } from "@chakra-ui/react"

import { GenreInterface } from "~/interfaces/genre";
import { MovieListsInterface } from "~/interfaces/movie-lists";
import MoviePoster from "~/components/movie/poster";

interface MoviesByGenreInterface {
  genre: GenreInterface,
  movies: MovieListsInterface
}

export default function CategoryDashboard({ genreList }: {genreList: MoviesByGenreInterface}) {
  return (
    <>
        <Box as="section" display="grid" gap={8} gridColumn={1} flex="1" p={4} pt={0} overflow="hidden">
            <Box as="section" flex="1" p={4} pt={0} overflow="hidden">
              <Box display="flex" justifyContent="space-between">
                <Heading as="h3" pb={4}>{genreList.genre.name}</Heading>
              </Box>
              <SimpleGrid
                  columns={{ base: 1, sm: 1, md: 3, lg: 4 }}
                  gap={4}
                >
                {
                  genreList.movies.results.map((item, i) => (
                      <MoviePoster key={i} item={item}/>
                  ))
                }
              </SimpleGrid>
              
              {/* <EmblaCarousel>
                {
                  genreList.movies.results.map((item, i) => (
                    <MoviePoster key={i} item={item}/>
                  ))
                }
              </EmblaCarousel> */}
            </Box> 
     
        </Box>
    </>
  );
}