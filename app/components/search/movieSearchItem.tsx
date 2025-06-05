import { Alert, Badge, Box, GridItem, Heading, Text } from "@chakra-ui/react";
import { MovieSuggestionInterface } from "~/interfaces/suggestions";
import MoviePoster from "../movie/poster";
import { getFormattedDate } from "~/utils/helpers";
import { Link } from "@remix-run/react";
import { WiStars } from "react-icons/wi";
const MovieSearchItem = ({ item }: { item: MovieSuggestionInterface}) => {
  
  return (
    <GridItem p="4" rounded="md" borderColor="gray.100" display="flex" gap={8} bg="gray.900" mb={8}>
        <Box width="250px">{ item.tmdbData && (<MoviePoster item={item.tmdbData} /> )}</Box>
        <Box flex="1">
            <Heading as="h3" lineHeight={1} letterSpacing="0.225rem" size="4xl" fontFamily="'Epilogue', sans-serif" fontWeight={400}>{item.title}</Heading>
            <Alert.Root title="Success" status="success" mt={4} colorPalette="green">
              <Alert.Indicator><WiStars /></Alert.Indicator>
              <Alert.Content color="fg">
                <Alert.Title>Ai Reason</Alert.Title>
                <Alert.Description>
                  {item.reason}
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
            <Text mt={4}>{item.tmdbData?.overview}</Text>
            { item.tmdbData && (<Text mt={4}>Released { getFormattedDate({release_date: item.tmdbData.release_date, options: {year: 'numeric', month: 'long',day: 'numeric'}, region:'en-US'}) }</Text>)}

            <Box display="flex" gap={2} mt={4}>
                {
                  item.tags.map((item, index) => (
                    <Link to={`/genre/${item.toLowerCase()}`} key={index}>
                      <Badge size="md" colorPalette="orange"> {item} </Badge>
                    </Link>
                  ))
                }
            </Box>
            <Box display="flex" gap={2} mt={4}>
                {
                  item.themes.map((item, index) => (
                    <Link to={`/genre/${item.toLowerCase()}`} key={index}>
                      <Badge size="md" colorPalette="red"> {item} </Badge>
                    </Link>
                  ))
                }
            </Box>

        </Box>
    </GridItem>
  );
};

export default MovieSearchItem;