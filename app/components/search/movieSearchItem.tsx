import { GridItem, Heading } from "@chakra-ui/react";
import { MovieSuggestionInterface } from "~/interfaces/suggestions";

const MovieSearchItem = ({ item }: { item: MovieSuggestionInterface}) => {
  
  return (
    <GridItem p="4" rounded="md" borderColor="gray.100" display="flex" gap={8} bg="gray.900" mb={8}>
        <img src={`https://image.tmdb.org/t/p/original${item.tmdbData?.poster_path}`} width="200" height="100%"  alt=""/>
        <div>
            <Heading as="h3" size="lg" mb={2}>
                {item.title}
            </Heading>
            <p> Year: {item.year}</p>
            <p> Reason: {item.reason}</p>
            <p> Themes: {item.themes}</p>
            <p> Tags: {item.tags}</p>
        </div>
    </GridItem>
  );
};

export default MovieSearchItem;