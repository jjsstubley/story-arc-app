import {  Badge, Box, Flex, Heading, SimpleGrid, Text, IconButton, Image } from "@chakra-ui/react";
import '~/styles.css'
import { Link } from "@remix-run/react";
import { getFormattedDate } from "~/utils/helpers";
import { WatchlistInterface } from "~/interfaces/watchlist";
import MediaImage from "../media/common/movie-image";
import BlurredPlaceholder from "../media/common/blurred-placeholder";
import EditWatchlistDialog from "./edit-watchlist-dialog";
import { usePosterGradientColor } from "~/hooks/use-poster-gradient-color";
import { HiPencil } from "react-icons/hi";
import { forwardRef } from "react";

interface WatchlistHeroProps {
  watchlist: WatchlistInterface;
  height?: string;
}

const WatchlistHero = forwardRef<HTMLHeadingElement, WatchlistHeroProps>(({watchlist, height = '00px'}, ref) => {
    const firstMovie = watchlist?.watchlist_items?.[0];
    const gradientColor = usePosterGradientColor(
      firstMovie?.movie?.id,
      firstMovie?.movie?.poster_path,
      undefined // Fallback to "orange.900" if no movie
    );

    if (!watchlist) return (<Box width="100%" height={height} backgroundColor="gray.900" rounded="md"></Box>)
    
    const items = (watchlist.watchlist_items || []).slice(0, 4);
    const placeholderCount = Math.max(0, 4 - items.length);
    
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
              {/* Text and Data */}
              <Box display="flex" gap={4} alignItems="center" >
                <Box display="flex" gap={2} alignItems="end" flex={1}>
                  <Heading ref={ref} as="h1" lineHeight={1}  size="4xl"  fontWeight={600}>{watchlist.name}</Heading>
                </Box>
                <EditWatchlistDialog 
                  watchlist={watchlist}
                  trigger={
                    <IconButton 
                      variant="subtle" 
                      border="1px solid" 
                      borderColor="whiteAlpha.300" 
                      rounded="full"
                      aria-label="Edit watchlist"
                      size="sm"
                    >
                      <HiPencil />
                    </IconButton>
                  }
                />
              </Box>

              <Text mt={4}>{watchlist.descriptions}</Text>
              <Text mt={4} fontSize="xs">Created { getFormattedDate({release_date: watchlist.created_at, options: {year: 'numeric', month: 'long',day: 'numeric'}, region:'en-US'}) }</Text>
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
});

WatchlistHero.displayName = 'WatchlistHero';

export default WatchlistHero;