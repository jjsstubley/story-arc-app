import { Grid } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import { SuggestionsDataInterface } from "~/interfaces/suggestions";
import MovieSearchItem from "./movieSearchItem";

const Suggestions = ({ fetcher }: { fetcher: ReturnType<typeof useFetcher<SuggestionsDataInterface>>}) => {

  if (fetcher.state === "loading") {
    return <p>Loading...</p>;
  }

  if (fetcher.data?.error) {
    return <p>Error: {fetcher.data.error}</p>;
  }

  return (
    <>
        {fetcher.data?.result && (
            <> 
                <h3>Suggestions</h3>
                <Grid columns={2} gap={2}>
                    {fetcher.data.result.suggestions.map((item, index) => (
                        <MovieSearchItem key={index} item={item} />
                    ))}
                </Grid>
            </>
        )}
        {/* Suggestions:
        <Grid className="grid grid-cols-2 gap-4">
        {fetcher.data?.result && (
            fetcher.data.result.suggestions.map((item, index) => ( 
            <GridItem key={index} p="4" rounded="md" borderColor="slate.100">
                <p> Title: {item.title}</p>
                <p> Year: {item.year}</p>
                <p> Reason: {item.reason}</p>
                <p> Themes: {item.themes}</p>
                <p> Tags: {item.tags}</p>
            </GridItem>
            )
            
        ))}
        </Grid> */}

        {fetcher.data?.error && <p>Error: {fetcher.data.error}</p>}
    </>
  );
};

export default Suggestions;