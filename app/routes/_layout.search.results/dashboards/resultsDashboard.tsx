import { Box, Heading, SimpleGrid } from "@chakra-ui/react"
import { useSearchParams, useNavigate } from "@remix-run/react";
import { useEffect, useRef } from "react";
import MoviePoster from "~/components/movie/poster";
import { PaginationComponent } from "~/components/ui/pagination";
// import MovieSearchItem from "~/components/search/movieSearchItem";
import { MovieListsInterface } from "~/interfaces/movie-lists";

export default function ResultsDashboard({ results: initialResults }: {results: MovieListsInterface}) {
  const [searchParams] = useSearchParams();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate()


  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);
  
  return (
    <>
        <Box ref={containerRef} as="section" display="grid" gap={8} gridColumn={1} flex="1" p={4} pt={0} overflow="hidden">
            <Box as="section" flex="1" px={4} overflow="hidden">
              <Box display="flex" justifyContent="space-between">
                <Heading as="h3" pb={4}>Results</Heading>
              </Box>
              <SimpleGrid
                  columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
                  gap={4}
                >
                {initialResults?.results.map((item, index) => (
                    <MoviePoster key={index} item={item} />
                ))}
              </SimpleGrid>
              <Box mt={8} display="flex" width="100%" justifyContent="end">
                <PaginationComponent
                  currentPage={initialResults.page}
                  totalPages={initialResults.total_pages}
                  searchParams={searchParams}
                  onPageChange={(newParams) => {
    
                    navigate(`/search/results?${newParams}`, {
                      replace: false,            // Set to true if you want to replace history instead of pushing
                      preventScrollReset: true,  // Keeps the scroll position
                    });
        
                  }}
                />
              </Box>
            </Box> 
     
        </Box>
    </>
  );
}