import { Box } from "@chakra-ui/react";
import MovieProviders from "~/components/movie/movie-Providers";
import {  WatchProvidersByProductionInterface } from "~/interfaces/tmdb/provider";

const ProvidersSection = ({providers} : { providers: WatchProvidersByProductionInterface }) => {
    const region = 'AU';
    
    return (
      <Box listStyle="none" padding={0} margin={0} spaceY={4} pl={4} borderLeft="1px solid" borderColor="gray.700">
          {
              providers?.results[region] && ( <MovieProviders providers={providers?.results[region]} />)
          }
      </Box>
    );
};

export default ProvidersSection;