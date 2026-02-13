import { Box, Grid, Heading } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import { SuggestionsDataInterface } from "~/interfaces/suggestions";
import MovieSearchItem from "../movieSearchItem";

const SuggestionsResults = ({ fetcher }: { fetcher: ReturnType<typeof useFetcher<SuggestionsDataInterface>>}) => {

  if (fetcher.state === "loading") {
    return <Box height="300px" width="100%" display="flex" alignItems="center" justifyContent="center">loading....</Box>;
  }

  if (fetcher.data?.error) {
    return <p>Error: {fetcher.data.error}</p>;
  }

  return (
    <>
        {fetcher.data?.result && (
            <> 
                <Heading as="h4" fontSize="md">Suggestions</Heading>
                <Grid columns={2} gap={2} mt={4}>
                    {fetcher.data.result.suggestions.map((item, index) => (
                        <MovieSearchItem key={index} item={item} />
                    ))}
                </Grid>
            </>
        )}

        {fetcher.data?.error && <p>Error: {fetcher.data.error}</p>}
    </>
  );
};

export default SuggestionsResults;