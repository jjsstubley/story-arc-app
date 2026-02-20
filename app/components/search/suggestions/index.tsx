import { Flex, Input, Button } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import { useRef, useState } from "react";
import SuggestionsDialog from "../suggestions/dialog";
import { SuggestionsDataInterface } from "~/interfaces/suggestions";


const SuggestionsInput = () => {
  const fetcher = useFetcher<SuggestionsDataInterface>();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    // Validate query before submitting
    if (!query || query.trim().length === 0) {
      return; // Don't submit empty queries
    }

    const formData = new FormData();
    formData.append("query", query.trim());

    fetcher.submit(formData, {
      method: "post",
      action: "/api/suggestions",
    });
  };

  const handleMainInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  };
  
  return (
    <Flex direction="column" gap={4} w="100%">
      <Input
        ref={inputRef}
        name="search"
        variant="outline"
        colorPalette="orange"
        flex={1}
        value={query}
        onChange={handleMainInputChange}
        onKeyDown={handleKeyDown}
        py={2}
        placeholder="What movie can I help you find."
      />

      <SuggestionsDialog fetcher={fetcher} query={query}>
        <Button 
          onClick={handleSearch}
          disabled={!query || query.trim().length === 0 || fetcher.state === "submitting"}
          loading={fetcher.state === "submitting"}
        >
          {fetcher.state === "submitting" ? "Searching..." : "Recommend"}
        </Button>
      </SuggestionsDialog>
    </Flex>
  );
};

export default SuggestionsInput;