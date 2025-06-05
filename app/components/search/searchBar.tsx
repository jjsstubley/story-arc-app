import {
  Box,
  Flex,
  Input,
  Tag,
  Button
} from "@chakra-ui/react";
// import { useOutsideClick } from "@chakra-ui/utils"
// import { Form, useFetcher } from "@remix-run/react";
import { useRef, useState, useEffect } from "react";

import SlashCommandEngine from "./CommandEngines/slash";
import GlobalGenreCommandEngine from "./CommandEngines/global-genre";

import { IoIosClose } from "react-icons/io";
import { GenreInterface } from "~/interfaces/genre";
import GlobalKeywordCommandEngine from "./CommandEngines/global-keyword";
import GlobalCastCommandEngine from "./CommandEngines/global-cast";
import { ComboboxItemProp } from "../ui/combobox/interfaces/combobox-item";
import {  useSearchParams, useFetcher } from "@remix-run/react";
import AtCommandEngine from "./CommandEngines/at";
import { ExtendedValueChangeDetails } from "./CommandEngines/interfaces/ExtendedValueChangeDetails";
import { SuggestionsDataInterface } from "~/interfaces/suggestions";
import SuggestionsDialog from "./suggestions-dialog";

type Chip = {
  type: "with_keywords" | "with_genres" | "with_cast";
  value: string;
  ids?: string;
};

const SearchBar = ({ genres} : { genres: GenreInterface[]} ) => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [chips, setChips] = useState<Chip[]>([]);
  const [currentChip, setCurrentChip] = useState<Chip | null>(null);
  const [showSlashCommand, setShowSlashCommand] = useState(false)
  const [showAtCommand, setShowAtCommand] = useState(false)
  const fetcher = useFetcher<SuggestionsDataInterface>()
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);
  // const [activeToken, setActiveToken] = useState<{
  //   trigger: "/" | "@";
  //   query: string;
  //   startIndex: number;
  // } | null>(null);

  useEffect(() => {
    const loadedChips: Chip[] = [];
  
    // Parse all chips from query params
    for (const [key, val] of searchParams.entries()) {
      if (key.startsWith("chips[")) {
        const [type, ids, value] = val.split(":");
        if (type && ids) {
          const chip: Chip = {
            type: type as Chip["type"],
            value, // You might replace this with a readable label if needed
            ids,
          };
          loadedChips.push(chip);
        }
      }
    }
  
    if (loadedChips.length > 0) {
      setChips(loadedChips);
    }
  
    // Optional: restore input value from `search` param
    const input = searchParams.get("search");
    if (input) {
      setQuery(input);
    }
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);
  // const containerRef = useRef(null);

  function getLatestTriggerToken(input: string) {
    const match = input.match(/(?:^|\s)([@/])([a-zA-Z0-9_-]*)$/);
    if (!match) return null;
  
    return {
      trigger: match[1] as "/" | "@", // '/' or '@'
      query: match[2],   // the query part, e.g., "Tom"
      startIndex: match.index! + match[0].indexOf(match[1]), // index of @ or /
    };
  }

  const handleMainInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
  
    const token = getLatestTriggerToken(value);
    if (token) {
      if (token.trigger === "/") {
        // fetchFieldSuggestions(token.query);
        setShowSlashCommand(true)

      } else if (!value.includes("/")) {
        // If no '/' is left in the input, close the slash command
        setShowSlashCommand(false);
      }


      if(token.trigger === '@') {
        setShowAtCommand(true)
      }
      // setActiveToken(token);
    }

    setQuery(value);
    
  };


  // const addChip = (field: { name: string; value: string }) => {
  //   if (activeToken) {
  //     setCurrentChip({
  //       type: field.value as Chip["type"],
  //       value: inputValue,
  //     });
  //     setQuery("");
  //     setActiveToken(null);
  //   }
  // };

  // const handleTokenKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { 
  //   if (e.key === "Enter") {
  //     if (activeToken) {
  //       const typeMap: Record<string, Chip["type"]> = {
  //         with_keywords: "with_keywords",
  //         with_genres: "with_genres",
  //         with_cast: "with_cast",
  //         // add more if needed
  //       };
  
  //       const inferredType = typeMap[activeToken.query.toLowerCase()] ?? "with_keywords";
  
  //       setChips([
  //         ...chips,
  //         {
  //           type: inferredType,
  //           value: activeToken.query,
  //         },
  //       ]);
  //       setActiveToken(null);
  //       setCurrentChip(null);
  //     }
  //   }
  // }

  function handleColon() {
    const colonMatch = query.match(/^\s*(\w+)\s*:\s*(.+)$/);
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
        setQuery("");
        return;
      }
    }

  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!query.includes("/") && showSlashCommand) {
        setShowSlashCommand(false);
      }
    }
  
    if (e.key === "Enter") {
      e.preventDefault();
  
      // 1. Handle when editingChip is active
      if (currentChip) {
        setChips([...chips, currentChip]);
        setCurrentChip(null);
        setQuery("");
        return;
      }
  
      handleColon()
    }
  };
  const removeLastChar = () => {
    setQuery((prev) => prev.slice(0, -1));
  };

  const handleTaggingSelect = (selected: ExtendedValueChangeDetails | null) => {
    removeLastChar()
    if (!selected) {
      setCurrentChip(null);
      setShowSlashCommand(true);
      return
    }
    let stringVal = "";
    let idVals = ""
    // Handle selected field here (e.g., set as currentChip)
    selected.items.forEach((item: ComboboxItemProp, index: number) => {
      const condition = selected.conditions[item.name];

      stringVal += item.name;
      idVals += item.id
  
      if (index < selected.value.length - 1) {
        if (condition === "and") {
          stringVal += ",";
          idVals += ","
        } else if (condition === "or") {
          stringVal += "|";
          idVals += '|'
        }
      }
    });
    if (currentChip) {
      setChips([
        ...chips,
        {
          type: currentChip.type,
          value: stringVal,
          ids: idVals
        },
      ]);
    }
    setCurrentChip(null);

    inputRef.current?.focus();
  }

  const handleSearch = () => {
    const formData = new FormData();
    formData.append("query", query);

    fetcher.submit(formData, {
      method: "post",
      action: "/api/suggestions",
    });
  };

  return (
    <Box pb={4} borderBottomWidth="1px" position="relative">
      {currentChip ? (
          commandEngineMap[currentChip.type]?.({ onSelect: handleTaggingSelect, genres })
        ) : (
            showSlashCommand ? (
              <SlashCommandEngine 
                onSelect={(selectedField) => {
                  removeLastChar()
                  // Handle selected field here (e.g., set as currentChip)
                  if (!selectedField) {
                    setShowSlashCommand(false);
                    setCurrentChip(null);
                    setTimeout(() => {
                      inputRef.current?.focus();
                    }, 0);
                    return
                  }
                  
                  setCurrentChip({
                    type: selectedField?.value as Chip["type"],
                    value: "", // query will be filled by user next
                  });
            
                  setShowSlashCommand(false);
                  // setQuery("");
                  setTimeout(() => {
                    inputRef.current?.focus();
                  }, 0);
                }}
              />
            ) : (
              showAtCommand ? (
                <AtCommandEngine 
                onSelect={(selected) => {
                  removeLastChar()
                  console.log('at selected', selected)
                  // Handle selected field here (e.g., set as currentChip)
                  // if (!selected) {
                  //   setShowSlashCommand(false);
                  //   setCurrentChip(null);
                  //   setTimeout(() => {
                  //     inputRef.current?.focus();
                  //   }, 0);
                  //   return
                  // }
                  
                  // setCurrentChip({
                  //   type: selected?.value as Chip["type"],
                  //   value: "", // query will be filled by user next
                  // });
            
                  setShowAtCommand(false);
                  // setQuery("");
                  setTimeout(() => {
                    inputRef.current?.focus();
                  }, 0);
                }}
              />
              ) : (
                // <Form method="post" action="/api/suggestions">
                  

                  <Flex gap={4}>
                    <Input
                      ref={inputRef}
                      name="search"
                      variant="subtle"
                      colorPalette="orange"
                      flex={1}
                      value={query}
                      onChange={handleMainInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="What movie can I help you find. You can search with / or @"
                    />
                    {
                      isClient && (
                        <SuggestionsDialog fetcher={fetcher} query={query}>
                          <Button onClick={handleSearch}>Search</Button>
                        </SuggestionsDialog>
                      )
                    }

                  </Flex>

                // </Form>
             
              )
            )
        )}
        <Flex gap={2} wrap="wrap" mt={4}>
          {chips.map((chip, idx) => (
            <Tag.Root key={idx} borderRadius="full" variant="solid" colorScheme="orange">
              <Tag.Label><strong>{chip.type}:</strong> {chip.value}</Tag.Label>
              <Tag.CloseTrigger>
                  <Box onClick={() =>
                    setChips(chips.filter((_, i) => i !== idx))
                  } >
                    <IoIosClose />
                  </Box>
                </Tag.CloseTrigger>
            </Tag.Root>
          ))}
        </Flex>
    </Box>
  );
};

export default SearchBar;

const commandEngineMap: Record<Chip["type"],
(props: { onSelect: (details: ExtendedValueChangeDetails | null) => void; genres?: GenreInterface[] }) => JSX.Element
> = {
with_genres: ({ onSelect, genres }) => (
  <GlobalGenreCommandEngine genres={genres!} onSelect={onSelect} />
),
with_keywords: ({ onSelect }) => (
  <GlobalKeywordCommandEngine onSelect={onSelect} />
),
with_cast: ({ onSelect }) => (
  <GlobalCastCommandEngine onSelect={onSelect} /> // Replace with CastCommandEngine if you have one
),
// Add more mappings here...
};