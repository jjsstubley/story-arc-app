import { Box, Heading, SimpleGrid, Skeleton } from "@chakra-ui/react"

import { MovieListsInterface } from "~/interfaces/movie-lists";
import MoviePoster from "~/components/movie/poster";
import { useInfiniteQuery} from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef, useState } from "react";
import { TmdbMovieInterface } from "~/interfaces/tdmi-movie";
import SortMenu from "~/components/search/filters/sort-menu";

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

interface ResultsLayoutProps {
  payload: MovieListsInterface;
  title: string;
  callback: (pageParam: number, sort: string) => Promise<{
    results: TmdbMovieInterface[];
    page: number;
    total_pages: number;
  }>;
}

export default function ResultsLayout({ payload, title, callback }: ResultsLayoutProps) {
  const parentRef = useRef(null);
  const [sort, setSort] = useState("popularity.desc");
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
  } = useInfiniteQuery({
    queryKey: ['results', 'page', 'total_pages', sort],
    initialPageParam: 1,
    initialData: {
      pageParams: [1],
      pages: [{ results: payload.results, page: payload.page, total_pages: payload.total_pages }],
    },
    getNextPageParam: (lastPage) => {
      console.log('lastPage', lastPage)
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    queryFn: async ({ pageParam = 1 }) => callback(pageParam, sort),
  });


  const movies = data.pages.flatMap(page => page.results);

  const rowVirtualizer = useVirtualizer({
    count: movies.length + (hasNextPage ? 1 : 0),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 70,
    overscan: 5,
  });

  return (
    <>
        <Box as="section" ref={parentRef} flex="1" p={4} overflow="hidden">
            <Box as="section" flex="1" overflow="hidden" height={rowVirtualizer.getTotalSize()}>
              <Box display="flex" justifyContent="space-between">
                <Heading as="h3" pb={4}>{title}</Heading>
              </Box>
              <Box display="flex" justifyContent="flex-end" mb={8}>
                <Box width="20%">
                  <SortMenu value={sort} onChange={(val) => setSort(val[0])}/>
                </Box>
              </Box>
              <SimpleGrid
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
              </SimpleGrid>
            </Box> 
        </Box>
    </>
  );
}