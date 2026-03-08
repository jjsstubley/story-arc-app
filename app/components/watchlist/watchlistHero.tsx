import { Badge, Box, Flex, SimpleGrid, Text, Image } from "@chakra-ui/react";
import '~/styles.css'
import { Link } from "@remix-run/react";
import { getFormattedDate } from "~/utils/helpers";
import { WatchlistInterface } from "~/interfaces/watchlist";
import MediaImage from "../media/common/movie-image";
import BlurredPlaceholder from "../media/common/blurred-placeholder";
import { usePosterGradientColor } from "~/hooks/use-poster-gradient-color";

interface WatchlistHeroProps {
  watchlist: WatchlistInterface;
  height?: string;
}

export default function WatchlistHero({ watchlist, height = '00px' }: WatchlistHeroProps) {
    const firstMovie = watchlist?.watchlist_items?.[0];
    const gradientColor = usePosterGradientColor(
      firstMovie?.movie?.id,
      firstMovie?.movie?.poster_path,
      undefined // Fallback to "orange.900" if no movie
    );

    if (!watchlist) return (<Box width="100%" height={height} backgroundColor="gray.900" rounded="md"></Box>)
    
    const allItems = watchlist.watchlist_items ?? [];
    const items = allItems.slice(0, 4);
    const placeholderCount = Math.max(0, 4 - items.length);
    const total = allItems.length;
    const seenCount = allItems.filter((i) => i.is_seen).length;
    const isComplete = total > 0 && seenCount === total;
    
    return (
      <Box position="relative" rounded="md" overflow="hidden">
        {/* Background image layer - subtle, centered */}
        {firstMovie && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={0}
            opacity={0.25}
            display="flex"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
          >
            <Image
              src={`https://image.tmdb.org/t/p/original/${firstMovie.movie.backdrop_path}`}
              width="100%"
              height="100%"
              objectFit="cover"
              objectPosition="center"
              filter="blur(10px) brightness(0.8)"
              transform="scale(1.1)"
            />
          </Box>
        )}

        {/* Gradient overlay */}
        <Box 
          position="relative"
          zIndex={1}
          backgroundColor="transparent" 
          bgGradient="to-b" 
          gradientFrom={gradientColor} 
          gradientTo="transparent" 
          pb={6}
        >
          <Flex p={4} alignItems="center" justifyContent="space-between" flexWrap="wrap-reverse" gap={4}>
            <Box color="white" flex={1} position="relative" zIndex={2}>
              <Text mt={4}>{watchlist.descriptions}</Text>
              <Text mt={4} fontSize="xs">Created { getFormattedDate({release_date: watchlist.created_at, options: {year: 'numeric', month: 'long',day: 'numeric'}, region:'en-US'}) }</Text>
              {total > 0 && (
                <Text mt={2} fontSize="sm" color="whiteAlpha.900">
                  {seenCount}/{total} films seen
                  {isComplete && (
                    <>
                      {" · "}
                      <Badge colorPalette="green" size="sm">List completed</Badge>
                    </>
                  )}
                </Text>
              )}
              <Box display="flex" gap={4} justifyContent="space-between">
                <Box display="flex" gap={2} mt={4}>
                    {
                      watchlist.tags.map((item, index) => (
                        <Link to={`/keywords/${item.toLowerCase()}`} key={index}>
                          <Badge size="md" colorPalette="orange"> {item} </Badge>
                        </Link>
                      ))
                    }
                </Box>
              </Box>
            </Box>
            <Box rounded="md" overflow="hidden" width="100%" minWidth="300px" maxWidth="300px" position="relative" zIndex={2}>
              <SimpleGrid columns={2}>
                {
                  items.map((i, index) => (
                    <MediaImage key={index} backdrop_path={i.movie.backdrop_path} height="100px" />
                  ))
                }
                {
                  Array.from({ length: placeholderCount }).map((_, index) => (
                    <BlurredPlaceholder 
                      key={`placeholder-${index}`} 
                      seed={`${watchlist.id}-${items.length + index}`}
                      height="100px" 
                    />
                  ))
                }
              </SimpleGrid>
            </Box>
          </Flex>
        </Box>
      </Box>
    );
}