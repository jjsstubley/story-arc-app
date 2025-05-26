import {
  Box,
  Flex,
  Input,
  Tag,
  Stack,
} from "@chakra-ui/react";
// import { useOutsideClick } from "@chakra-ui/utils"
// import { Form, useFetcher } from "@remix-run/react";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useColorModeValue } from "../ui/color-mode";
import { IoIosClose } from "react-icons/io";

type Chip = {
  type: "with_keywords" | "with_genres" | "with_cast";
  value: string;
};

const MotionBox = motion(Box);

const SearchBar = () => {
  const [inputValue, setInputValue] = useState("");
  const [chips, setChips] = useState<Chip[]>([]);
  const [currentChip, setCurrentChip] = useState<Chip | null>(null);
  const [suggestions, setSuggestions] = useState<{ name: string; value: string, description: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [activeToken, setActiveToken] = useState<{
    trigger: "/" | "@";
    query: string;
    startIndex: number;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  // const containerRef = useRef(null);

  // useOutsideClick({
  //   ref: containerRef,
  //   handler: () => setShowSuggestions(false),
  // });

  function getLatestTriggerToken(input: string) {
    const match = input.match(/(?:^|\s)([@/])([a-zA-Z0-9_-]*)$/);
    if (!match) return null;
  
    return {
      trigger: match[1] as "/" | "@", // '/' or '@'
      query: match[2],   // the query part, e.g., "Tom"
      startIndex: match.index! + match[0].indexOf(match[1]), // index of @ or /
    };
  }

  const bgColor = useColorModeValue("white", "gray.800");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
  
    if (currentChip) {
      // setCurrentChip({ ...currentChip, value });
      setInputValue(value);
    } else {
      const token = getLatestTriggerToken(value);
      if (token) {
        if (token.trigger === "/") {
          fetchFieldSuggestions(token.query);
        }
        setActiveToken(token);
      } else {
        setShowSuggestions(false);
      }
  
      setInputValue(value);
    }
  };

  function fetchFieldSuggestions(query: string) {
    const allFields = [
      { name: "with_keywords", value: "with_keywords", description: 'Search for themes from a large collection of keywords. Use a comma (AND) or pipe (OR) for complex filtering' },
      { name: "with_genres", value: "with_genres", description: 'Search for base genres from a set list. Use a comma (AND) or pipe (OR) for complex filtering' },
      { name: "with_cast", value: "with_cast", description: 'blah blah Blah' },
      // ... etc.
    ];
  
    const filtered = allFields.filter(field =>
      field.name.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered);
    setShowSuggestions(true)
  }

  const addChip = (field: { name: string; value: string }) => {
    if (activeToken) {
      setCurrentChip({
        type: field.value as Chip["type"],
        value: "",
      });
      setInputValue("");
      setActiveToken(null);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
  
      // 1. Handle when editingChip is active
      if (currentChip) {
        setChips([...chips, currentChip]);
        setCurrentChip(null);
        setInputValue("");
        return;
      }
  
      // 2. Handle if user types something like "keyword: eerie"
      const colonMatch = inputValue.match(/^\s*(\w+)\s*:\s*(.+)$/);
      if (colonMatch) {
        const namespace = colonMatch[1].toLowerCase();
        const value = colonMatch[2];
  
        const knownTypes = {
          with_keywords: "with_keywords",
          with_genres: "with_genres",
          with_cast: "with_cast",
        } satisfies Record<string, Chip["type"]>;
  
        if (namespace in knownTypes) {
          const type = knownTypes[namespace as keyof typeof knownTypes];
          setChips([
            ...chips,
            {
              type: type,
              value,
            },
          ]);
          setInputValue("");
          return;
        }
      }
  
      // 3. Fallback to using activeToken or default
      if (activeToken) {
        const typeMap: Record<string, Chip["type"]> = {
          with_keywords: "with_keywords",
          with_genres: "with_genres",
          with_cast: "with_cast",
          // add more if needed
        };
  
        const inferredType = typeMap[activeToken.query.toLowerCase()] ?? "keyword";
  
        setChips([
          ...chips,
          {
            type: inferredType,
            value: inputValue,
          },
        ]);
        setInputValue("");
        setActiveToken(null);
      }
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? suggestions.length - 1 : (prev - 1 + suggestions.length) % suggestions.length
      );
    } else if (e.key === "Enter" && showSuggestions && selectedIndex >= 0) {
      e.preventDefault();
      const selected = suggestions[selectedIndex];
      addChip({
        name: selected.name,
        value: selected.value,
      });
      setSelectedIndex(-1);
    }
  };
  
  return (
    <Box pb={4} borderBottomWidth="1px" position="relative">
      {currentChip ? (
          <Box position="relative" display="flex" gap={2} alignItems="center">
            <Tag.Root  borderRadius="full" variant="solid" colorScheme="orange" zIndex={10} left="10px">
              <Tag.Label>{currentChip.type}: </Tag.Label>
            </Tag.Root>
            <Input
              ref={inputRef}
              variant="subtle"
              colorPalette="orange"
              border="1px solid orange"
              flex={1}
              value={currentChip ? inputValue : inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type /keywords or @name..."
            />
          </Box>
        ) : (
          <Input
            ref={inputRef}
            variant="subtle"
            colorPalette="orange"
            flex={1}
            value={currentChip ? inputValue : inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="What movie can I help you find. You can search with / or @"
          />
        )}
      <Flex gap={2} wrap="wrap" mt={4}>
        {chips.map((chip, idx) => (
          <Tag.Root key={idx} borderRadius="full" variant="solid" colorScheme="orange">
            <Tag.Label>{chip.type} : {chip.value}</Tag.Label>
            <Tag.CloseTrigger>
                <Box onClick={() =>
                  setChips(chips.filter((_, i) => i !== idx))
                } >
                  <IoIosClose />
                </Box>
              </Tag.CloseTrigger>
          </Tag.Root>
        ))}
        {/* {currentChip && (
          <Tag.Root  borderRadius="full" variant="solid" colorScheme="blue" zIndex={10}>
            <Tag.Label>{currentChip.type}: {inputValue}</Tag.Label>
          </Tag.Root>
        )} */}
      </Flex>
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <MotionBox
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            position="absolute"
            top="40px"
            mt={2}
            bg={bgColor}
            boxShadow="lg"
            borderRadius="md"
            borderWidth="1px"
            zIndex={10}
            w="100%"
          >
            <Stack padding={2} gap={4}>
              {suggestions.map((s, i) => (
                <Box
                  key={i}
                  p={2}
                  display="flex"
                  flexDirection="column"
                  rounded="md"
                  bg={i === selectedIndex ? "orange.100" : undefined}
                  _hover={{ bg: "gray.900" }}
                  cursor="pointer"
                  onClick={() =>
                    setCurrentChip({
                      type: s.name as Chip["type"],
                      value: "",
                    })
                  }
                >
                  <strong>{s.name}</strong>
                  <small>{s.description}</small>
                </Box>
              ))}
            </Stack>
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default SearchBar;