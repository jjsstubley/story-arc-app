import {  Badge, Box, Flex, Heading, SimpleGrid, Text, IconButton } from "@chakra-ui/react";
import '~/styles.css'
import { Link } from "@remix-run/react";
import { getFormattedDate } from "~/utils/helpers";
import { WatchlistInterface } from "~/interfaces/watchlist";
import MediaImage from "../media/common/movie-image";
import BlurredPlaceholder from "../media/common/blurred-placeholder";
import EditWatchlistDialog from "./edit-watchlist-dialog";
import { HiPencil } from "react-icons/hi";

const WatchlistHero = ({watchlist, height = '00px'} : {watchlist: WatchlistInterface, height?: string}) => {

    if (!watchlist) return (<Box width="100%" height={height} backgroundColor="gray.900" rounded="md"></Box>)
    
    const items = watchlist.watchlist_items.slice(0, 4);
    const placeholderCount = Math.max(0, 4 - items.length);
    
    return (
      <Box backgroundColor="transparent" bgGradient="to-b" rounded="md" gradientFrom="orange.900" gradientTo="transparent" pb={6}>
        <Flex p={4} alignItems="center" justifyContent="space-between" flexWrap="wrap-reverse" gap={4}>
        <Box color="white" flex={1}>
          {/* Text and Data */}
          <Box display="flex" gap={4} alignItems="center" >
            <Box display="flex" gap={2} alignItems="end" flex={1}>
              <Heading as="h1" lineHeight={1}  size="4xl"  fontWeight={600}>{watchlist.name}</Heading>
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
        <Box rounded="md" overflow="hidden" width="100%" minWidth="300px" maxWidth="300px">
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
    );
};

export default WatchlistHero;