import {  Badge, Box, Flex, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import './styles.css'
import MovieImage from "../movie/movieImage";
import { Link } from "@remix-run/react";
import { getFormattedDate } from "~/utils/helpers";
import { WatchlistInterface } from "~/interfaces/watchlist";

const WatchlistHero = ({watchlist, height = '00px'} : {watchlist: WatchlistInterface, height?: string}) => {

    if (!watchlist) return (<Box width="100%" height={height} backgroundColor="gray.900" rounded="md"></Box>)
    return (
      <Box p={4} backgroundColor="gray.900">
        <Flex alignItems="end">
        <Box color="white" p={4} flex={1}>
          {/* Text and Data */}
          <Box display="flex" gap={4} alignItems="center" >
            <Box display="flex" gap={2} alignItems="end">
              <Heading as="h1" lineHeight={1}  size="4xl"  fontWeight={600}>{watchlist.name}</Heading>
              {/* <small>{movie.runtime} mins</small> */}
            </Box>
            {/* <WatchListDropdown movieId={movie.id}/> */}
            {/* This shows up only once user have mark as seen */}
            {/* <IconButton variant="subtle" border="1px solid" borderColor={"whiteAlpha.300"} rounded="full" onClick={() => setIsFavourite((prev) => !prev)}>
                {isFavourite ? (<Text color="red"><GoHeartFill size={28}/></Text>) : (<Text><GoHeart size={28}/></Text>) }
            </IconButton> */}
          </Box>

          <Text mt={4}>{watchlist.descriptions}</Text>
          <Text mt={4}>Created { getFormattedDate({release_date: watchlist.created_at, options: {year: 'numeric', month: 'long',day: 'numeric'}, region:'en-US'}) }</Text>
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
        <Box rounded="md" overflow="hidden" width="300px">
            <SimpleGrid columns={2}>
              {
                watchlist.watchlist_items.slice(0,4).map((i, index) => (
                  <MovieImage key={index} backdrop_path={i.movie.backdrop_path} height="100px" />
                ))
              }
            </SimpleGrid>
          </Box>
        </Flex>
      </Box>
    );
};

export default WatchlistHero;