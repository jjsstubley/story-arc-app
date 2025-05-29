import { Box, Heading, SimpleGrid, Image, Card } from "@chakra-ui/react"
;
import { GenreInterface } from "~/interfaces/genre";
import { MovieListsInterface } from "~/interfaces/movie-lists";
import { Link } from "@remix-run/react";

interface MoviesByGenreInterface {
  genre: GenreInterface,
  movies: MovieListsInterface
}
<div>Logo created by <a href="https://www.designevo.com/" title="Free Online Logo Maker">DesignEvo logo maker</a></div>
export default function GenreDashboard({ moviesByGenre }: {moviesByGenre: MoviesByGenreInterface[]}) {
  return (
    <>
        <Box as="section" display="grid" gap={8} gridColumn={1} flex="1" p={4} pt={0} overflow="hidden">
          <SimpleGrid columns={{ base: 1, sm: 1, md: 3, lg: 4 }}gap={4}>
          {
            moviesByGenre.map((list: MoviesByGenreInterface, index: number) => (
                <Link key={index} to={`/genre/${list.genre.name.toLowerCase()}`}>
                  <Card.Root  width="100%">
                      <Card.Body gap="2" p={0} overflow="hidden" rounded="md" border="1px solid transparent" 
                          _hover={{
                              border: "1px solid white"
                          }}
                      >
                        <Box>
                          <Image 
                            src={`https://image.tmdb.org/t/p/original/${list.movies.results[Math.floor(Math.random() * 19) + 1].backdrop_path}`}
                            width="100%" 
                            height="100%" 
                            aspectRatio={3 / 2}
                            objectFit="cover" 
                            transition="transform 0.3s ease"
                            _hover={{
                                transform: "scale(1.05)",
                                cursor: "pointer",
                            }}
                            alt=""/>
                        </Box>
                        <Box display="flex" width="100%" justifyContent="center" alignItems="center" pos="absolute" bottom={0} bg="blackAlpha.700">
                            <Heading as="h3" letterSpacing="0.2rem" fontFamily="'Urbanist', sans-serif" fontSize="md">{list.genre.name}</Heading>
                        </Box>
                      </Card.Body>
                  </Card.Root>
                </Link>
            ))
          }
          </SimpleGrid>
        </Box>
    </>
  );
}