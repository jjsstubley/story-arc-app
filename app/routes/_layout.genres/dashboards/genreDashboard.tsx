import { Box, Heading, SimpleGrid, Image, Card } from "@chakra-ui/react";
import { Link } from "@remix-run/react";

interface GenreDashboardProps { 
  id: number,
  updated_at: string,
  tmdb_movie_id: string,
  backdrop_path: string,
  name: string,
}

export default function GenreDashboard({ genres }: {genres: GenreDashboardProps[]}) {
  console.log('genres'  , genres)
  return (
    <>
        <Box as="section" display="grid" gap={4} gridColumn={1} flex="1" p={4} py={8} overflow="hidden">
          <Heading as="h3" pb={4}>Genres</Heading>
          <SimpleGrid columns={{ base: 1, sm: 1, md: 3, lg: 4 }} gap={6}>
          {
            genres.map((genre: GenreDashboardProps, index: number) => (
                <Link key={index} to={`/genres/${genre.name.toLowerCase()}`}>
                  <Card.Root  width="100%">
                      <Card.Body gap="2" p={0} overflow="hidden" rounded="md" border="1px solid transparent" 
                          _hover={{
                              border: "1px solid white"
                          }}
                      >
                        <Box>
                          <Image 
                            src={`https://image.tmdb.org/t/p/original/${genre.backdrop_path}`}
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
                            <Heading as="h3" letterSpacing="0.2rem" fontFamily="'Urbanist', sans-serif" fontSize="md">{genre.name}</Heading>
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