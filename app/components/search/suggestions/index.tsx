import { Flex, Input, Button } from "@chakra-ui/react";
import { useRef, useState } from "react";
import SuggestionsDialog from "../suggestions/dialog";
import { useSuggestionStream } from "~/hooks/use-suggestion-stream";


const SuggestionsInput = () => {
  const stream = useSuggestionStream();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const isStreaming = stream.state.status === "streaming";

  const handleSearch = () => {
    // Validate query before submitting
    if (!query || query.trim().length === 0) {
      return; // Don't submit empty queries
    }

    stream.start(query.trim());
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

      <SuggestionsDialog stream={stream}>
        <Button
          onClick={handleSearch}
          disabled={!query || query.trim().length === 0 || isStreaming}
          loading={isStreaming}
        >
          {isStreaming ? "Searching..." : "Recommend"}
        </Button>
      </SuggestionsDialog>
    </Flex>
  );
};

export default SuggestionsInput;
