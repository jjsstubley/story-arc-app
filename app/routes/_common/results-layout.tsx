import { Box, Heading, SimpleGrid, Skeleton, useBreakpointValue } from "@chakra-ui/react"

import { MovieListsInterface } from "~/interfaces/tmdb/movie-lists";
import MoviePoster from "~/components/movie/previews/poster";
import { useInfiniteQuery} from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef, useState } from "react";
import { TmdbMovieInterface } from "~/interfaces/tmdb/tdmi-movie";
import SortMenu from "~/components/search/filters/sort-menu";
import { useLocation } from "@remix-run/react";

function useIntersectionObserver(callback: () => void) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1,
      }
    );

    observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [callback]);

  return ref;
}

export function useResizeObserver(
  ref: React.RefObject<HTMLElement>,
  callback: (rect: DOMRectReadOnly) => void
) {
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        callback(entries[0].contentRect);
      }
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, callback]);
}

interface FiltersProps {
  type: string,
  value: number
}
interface ResultsLayoutProps {
  payload: MovieListsInterface;
  title: string;
  filters?: FiltersProps[],
  sort_by: string;
  callback: (pageParam: number, sort: string, filters?: FiltersProps[]) => Promise<{
    results: TmdbMovieInterface[];
    page: number;
    total_pages: number;
  }>;
}


export default function ResultsLayout({ payload, title, callback, filters, sort_by }: ResultsLayoutProps) {
  const parentRef = useRef(null);
  const [sort, setSort] = useState(sort_by);
  const location = useLocation();
  const columns = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }) ?? 1;
  const rowMeasurementRef = useRef<HTMLDivElement | null>(null);
  const [rowHeight, setRowHeight] = useState(250);
  const startPage = Number(new URLSearchParams(location.search).get("page") || 1);
  // const [featureMovie, setFeatureMovie] = useState<TmdbMovieInterface>(payload.results[0]);
  
  useEffect(() => {
    // Smooth scroll on URL param changes (e.g., filter updates)
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.search]);

  const loadMoreRef = useIntersectionObserver(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  });
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    // isError,
    // error,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['results', 'page', 'total_pages', sort, filters],
    initialPageParam: 1,
    initialData: {
      pageParams: [1],
      pages: [{ results: payload.results, page: payload.page, total_pages: payload.total_pages }],
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    queryFn: async ({ pageParam = 1 }) => callback(pageParam, sort, filters),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });


  const movies = data.pages.flatMap(page => page.results);

  const movieRows: TmdbMovieInterface[][] = [];
  for (let i = 0; i < movies.length; i += columns) {
    movieRows.push(movies.slice(i, i + columns));
  }

  const rowVirtualizer = useVirtualizer({
    count: movieRows.length + (hasNextPage ? 1 : 0),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 315,
    overscan: 5,
    gap: 8,
    measureElement: (el) => {
      return el.getBoundingClientRect().height
    },
  });


  useEffect(() => {
    rowVirtualizer.scrollToIndex(0); // scroll to top on filter change
  }, [sort, filters]);

  useEffect(() => {
    if (!data || data.pages.length === 0) return;
    const lastPageFetched = data.pages[data.pages.length - 1].page;
  
    const url = new URL(window.location.href);
    url.searchParams.set("page", lastPageFetched.toString());
    url.searchParams.set("sort", sort);
    window.history.replaceState(null, "", url.toString());
  }, [data]);

  useEffect(() => {
    let currentPage = 1;
    if (startPage <= 1) return;
  
    const loadPages = async () => {
      while (currentPage < startPage && hasNextPage) {
        await fetchNextPage();
        currentPage++;
      }
    };
    loadPages();
  }, []);

  useResizeObserver(rowMeasurementRef, (rect) => {
    const measuredHeight = rect.height;
    if (measuredHeight !== rowHeight) {
      setRowHeight(measuredHeight + 20); // or adjust padding here if needed
    }
  });

  useEffect(() => {
    rowVirtualizer.scrollToIndex(0);
    rowVirtualizer.measure();
  }, [columns]);

  return (
   
        <Box as="section" ref={parentRef} flex="1" p={4} overflow="auto" width="100%" height="82vh" position="relative">
               {/* <Box  height="400px" width="100%" mb={8} position="absolute" top={0} left={0}>
                  <Box display="flex"  position="relative" flex={1} height="100%" rounded="lg">
                
                      <FeatureMovie movie={featureMovie}/>
                   
                  </Box>
                </Box> */}
            <Box as="section" flex="1" overflow="hidden" >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" justifyContent="space-between">
                  <Heading as="h3" pb={4}>{title}</Heading>
                </Box>
                <Box display="flex" justifyContent="flex-end" mb={8} gap={4}>
                  <Box width="200px">
                    <SortMenu value={sort} onChange={(val) => setSort(val[0])}/>
                  </Box>
                </Box>
              </Box>
              {
                !isLoading && movies.length === 0 && (
                  
                    <Box p={8} textAlign="center">
                      <Heading size="md" mb={4}>No movies found</Heading>
                      <Box>Try adjusting your filters or search query.</Box>
                    </Box>
                 
                )
              }
              {
                isLoading &&  (
                  
                    <Box p={8} textAlign="center">
                      <Heading size="md" mb={4}>No movies found</Heading>
                      <Box>Try adjusting your filters or search query.</Box>
                    </Box>
                 
                )
              }
              <Box position="relative" >
                <Box position="absolute" visibility="hidden" top={0} left={0} width="100%" ref={rowMeasurementRef}>
                  <Box display="flex" gap={4} px={4}>
                    {movies.slice(0, columns).map((item, i) => (
                      <MoviePoster key={`measure-${i}`} item={item} />
                    ))}
                  </Box>
                </Box>
              </Box>
              {
                !isLoading && movies.length > 0 && (
                  <Box>
                    <Box key={columns} height={rowVirtualizer.getTotalSize()} position="relative">
                      {
                        rowVirtualizer.getVirtualItems().map(virtualRow => {
                          const rowIndex = virtualRow.index;
                          const items = movieRows[rowIndex];
    
                          return (
                            <Box
                              key={virtualRow.key}
           
                              position="absolute"
                              top={0}
                              left={0}
                              width="100%"
                              transform={`translateY(${virtualRow.start}px)`}
                            >
                              <Box data-index={virtualRow.index}
                              ref={rowVirtualizer.measureElement}>
                                <SimpleGrid
                                  columns={columns}
                                  gap={4}
                                  px={4}
                                  alignItems="start"
                    
                                  // ref={(element) => measureElement(element)}
                                >
                                  {
                                    items?.map((item, colIndex: number) => (
                                      <Box data-index={virtualRow.index} key={`${rowIndex}-${colIndex}`} width="100%" ref={rowVirtualizer.measureElement}>
                                        <MoviePoster key={item.id ?? `${rowIndex}-${colIndex}`} item={item} />
                                      </Box>  
                                    )) ?? (
                                      <Skeleton height="200px" rounded="md" ref={loadMoreRef} />
                                    )
                                  }
                                </SimpleGrid>
                              </Box>
                            </Box>
                          );
                        })
    
                      }
                    {/* <SimpleGrid
                      columns={{ base: 1, sm: 1, md: 3, lg: 4, xl: 5 }}
                      gap={4}
                      alignItems="start"
                    >
                      {
                        rowVirtualizer.getVirtualItems().map(virtualRow => { 
                          const item = movies[virtualRow.index];
                          if (virtualRow.index > movies.length - 1) {
                            return (
                              <Skeleton height="200px" rounded="md" key={virtualRow.key} ref={loadMoreRef} /> 
                            );
                          }
  
                          if (isError) {
                            return (
                              <Box key={virtualRow.index} p={4} textAlign="center">
                                <Heading size="md" color="red.500" mb={4}>Something went wrong</Heading>
                                <Box>{(error as Error).message || 'An unexpected error occurred.'}</Box>
                              </Box>
                            );
                          }
  
                          return (
                            <Box
                            key={virtualRow.key}
                            width="100%"
                      
                          >
                            {
                              item ? (
                                <MoviePoster key={virtualRow.key} item={item}/>
                              ): (
                                <Skeleton height="200px" rounded="md" /> 
                              )
                            }
                          </Box>
                          )
                        })
                      }
                    </SimpleGrid> */}
                  </Box>
                </Box>
                )
              }

            </Box> 
        </Box>
  
  );
}