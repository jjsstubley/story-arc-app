
// import SearchInput from "./searchInput";
// import Suggestions from "./suggestions";

// import { useFetcher } from "@remix-run/react";
import SearchBar from "~/components/search/searchBar";
import { GenreInterface } from "~/interfaces/genre";
// import SuggestionsDialog from "./suggestions-dialog";
// import { useFetcher } from "@remix-run/react";
// import { SuggestionsDataInterface } from "~/interfaces/suggestions";

const SearchFeature = ({ genres } : { genres: GenreInterface[] }) => {
  // const fetcher = useFetcher<SuggestionsDataInterface>();

  return (
    <>
    
      <SearchBar genres={genres} />
        {/* <SearchInput fetcher={fetcher}/>
        <Suggestions fetcher={fetcher}/> */}
    </>
  );
};

export default SearchFeature;