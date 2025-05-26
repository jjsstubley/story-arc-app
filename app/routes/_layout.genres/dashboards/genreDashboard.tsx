import { Box, Heading } from "@chakra-ui/react"

import { EmblaCarousel } from "~/components/emblaCarousel";
import MoviePoster from "~/components/movie/poster";
import { GenreInterface } from "~/interfaces/genre";
import { MovieListsInterface } from "~/interfaces/movie-lists";
import { IoIosArrowRoundForward } from "react-icons/io";
import { Link } from "@remix-run/react";

interface MoviesByGenreInterface {
  genre: GenreInterface,
  movies: MovieListsInterface
}

export default function GenreDashboard({ moviesByGenre }: {moviesByGenre: MoviesByGenreInterface[]}) {
  return (
    <>
        <Box as="section" display="grid" gap={8} gridColumn={1} flex="1" p={4} pt={0} overflow="hidden">
          {
            moviesByGenre.map((list: MoviesByGenreInterface, index: number) => (
              <Box key={index }as="section" flex="1" p={4} pt={0} overflow="hidden">
                <Box display="flex" justifyContent="space-between">
                  <Heading as="h3" pb={4}>{list.genre.name}</Heading>
                  <Link to={`/genre/${list.genre.name.toLowerCase()}`}><Box display="flex" gap={2} alignItems="center">See more <IoIosArrowRoundForward /></Box></Link>
                </Box>
                <EmblaCarousel>
                  {
                    list.movies.results.map((item, i) => (
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