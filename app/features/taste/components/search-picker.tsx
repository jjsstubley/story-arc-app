import { Box, Button, Flex, Input, Skeleton, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuPlus } from "react-icons/lu";
import { InlineError } from "~/shared/ui/inline-error";
import { useTasteSearch } from "../queries";
import type { TasteSearchResult, TasteSearchType } from "../types";

const DEBOUNCE_MS = 300;

interface SearchPickerProps {
  type: TasteSearchType;
  placeholder: string;
  /** Ids already picked; shown as added */
  selectedIds: number[];
  /** Adding more is disabled once the limit is reached */
  atLimit: boolean;
  onAdd: (result: TasteSearchResult) => void;
}

/** A search box with a short list of TMDB matches to add */
export default function SearchPicker({ type, placeholder, selectedIds, atLimit, onAdd }: SearchPickerProps) {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const { data: results, isFetching, isError, error, refetch } = useTasteSearch(type, query);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(input), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [input]);

  const searching = query.trim().length >= 2;

  return (
    <Box>
      <Input size="sm" value={input} onChange={(e) => setInput(e.target.value)} placeholder={placeholder} aria-label={placeholder} />

      {searching && (
        <Box mt={2} rounded="md" border="1px solid" borderColor="whiteAlpha.200" overflow="hidden">
          {isError ? (
            <Box p={3}>
              <InlineError fallback="Couldn't search right now." error={error} onRetry={() => refetch()} />
            </Box>
          ) : isFetching && !results ? (
            <Flex direction="column" gap={2} p={3}>
              {[0, 1, 2].map((row) => <Skeleton key={row} height="20px" />)}
            </Flex>
          ) : results && results.length === 0 ? (
            <Text p={3} fontSize="sm" color="fg.muted">No matches for “{query.trim()}”.</Text>
          ) : (
            results?.map((result) => {
              const added = selectedIds.includes(result.id);
              return (
                <Flex
                  key={result.id}
                  align="center"
                  justify="space-between"
                  gap={3}
                  px={3}
                  py={2}
                  borderTop="1px solid"
                  borderColor="whiteAlpha.100"
                  _first={{ borderTop: "none" }}
                >
                  <Box minW={0}>
                    <Text fontSize="sm" truncate>{result.name}</Text>
                    {result.detail && <Text fontSize="xs" color="fg.muted">{result.detail}</Text>}
                  </Box>
                  <Button
                    size="xs"
                    variant="outline"
                    flexShrink={0}
                    disabled={added || atLimit}
                    onClick={() => onAdd(result)}
                    aria-label={`Add ${result.name}`}
                  >
                    {added ? "Added" : <><LuPlus /> Add</>}
                  </Button>
                </Flex>
              );
            })
          )}
        </Box>
      )}
    </Box>
  );
}
