import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { Input, Box, Spinner } from "@chakra-ui/react";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const currentQuery = searchParams.get("q") || "";

  // Debounced search function
  const debouncedSearch = useCallback((searchQuery: string) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        navigate(`/search/overview?q=${encodeURIComponent(searchQuery.trim())}`);
      } else if (searchQuery === "" && currentQuery) {
        navigate("/");
      }
    }, 300);
  }, [navigate, currentQuery]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedSearch(newQuery);
  };

  // Sync input with URL changes
  useEffect(() => {
    setQuery(currentQuery);
  }, [currentQuery]);

  // Reset searching state
  useEffect(() => {
    setIsSearching(false);
  }, [currentQuery]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Box position="relative"  flex={1}>
      <Input
        value={query}
        onChange={handleInputChange}
        placeholder="Search movies, shows, people..."
        size="md"
        pr={isSearching ? 10 : 4}
      />
      {isSearching && (
        <Box
          position="absolute"
          right={3}
          top="50%"
          transform="translateY(-50%)"
        >
          <Spinner size="sm" />
        </Box>
      )}
    </Box>
  );
}