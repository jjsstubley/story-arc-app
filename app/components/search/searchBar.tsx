import {
  Box,
  Flex,
  Input,
  Tag,
  Combobox,
  Button
} from "@chakra-ui/react";
// import { useOutsideClick } from "@chakra-ui/utils"
// import { Form, useFetcher } from "@remix-run/react";
import { useRef, useState } from "react";

import SlashCommandEngine from "./CommandEngines/slash";
import GenreCommandEngine from "./CommandEngines/genre";

import { IoIosClose } from "react-icons/io";
import { GenreInterface } from "~/interfaces/genre";
import KeywordCommandEngine from "./CommandEngines/keyword";
import CastCommandEngine from "./CommandEngines/cast";
import { ComboboxItemProp } from "../ui/combobox/interfaces/combobox-item";
import { Form } from "@remix-run/react";
import AtCommandEngine from "./CommandEngines/at";


type Chip = {
  type: "with_keywords" | "with_genres" | "with_cast";
  value: string;
  ids?: string;
};

type ExtendedValueChangeDetails = Combobox.ValueChangeDetails & {
  conditions: Record<string, string>;
};

const SearchBar = ({ genres } : { genres: GenreInterface[] } ) => {
  const [inputValue, setInputValue] = useState("");
  const [chips, setChips] = useState<Chip[]>([]);
  const [currentChip, setCurrentChip] = useState<Chip | null>(null);
  const [showSlashCommand, setShowSlashCommand] = useState(false)
  const [showAtCommand, setShowAtCommand] = useState(false)

  // const [activeToken, setActiveToken] = useState<{
  //   trigger: "/" | "@";
  //   query: string;
  //   startIndex: number;
  // } | null>(null);

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

    setInputValue(value);
    
  };


  // const addChip = (field: { name: string; value: string }) => {
  //   if (activeToken) {
  //     setCurrentChip({
  //       type: field.value as Chip["type"],
  //       value: inputValue,
  //     });
  //     setInputValue("");
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

  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!inputValue.includes("/") && showSlashCommand) {
        setShowSlashCommand(false);
      }
    }
  
    if (e.key === "Enter") {
      e.preventDefault();
  
      // 1. Handle when editingChip is active
      if (currentChip) {
        setChips([...chips, currentChip]);
        setCurrentChip(null);
        setInputValue("");
        return;
      }
  
      handleColon()
    }
  };
  const removeLastChar = () => {
    setInputValue((prev) => prev.slice(0, -1));
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
                    value: "", // inputValue will be filled by user next
                  });
            
                  setShowSlashCommand(false);
                  // setInputValue("");
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
                  //   value: "", // inputValue will be filled by user next
                  // });
            
                  setShowAtCommand(false);
                  // setInputValue("");
                  setTimeout(() => {
                    inputRef.current?.focus();
                  }, 0);
                }}
              />
              ) : (
                <Form method="get" action="/search/results">
                  {chips.map((chip, index) => (
                    <Input
                      key={index}
                      type="hidden"
                      name={`chips[${index}]`}
                      value={`${chip.type}:${chip.ids}`}
                    />
                  ))}
                  <Flex gap={4}>
                    <Input
                      ref={inputRef}
                      name="search"
                      variant="subtle"
                      colorPalette="orange"
                      flex={1}
                      value={inputValue}
                      onChange={handleMainInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="What movie can I help you find. You can search with / or @"
                    />
                    <Button type="submit">Search</Button>
                  </Flex>
                </Form>
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
  <GenreCommandEngine genres={genres!} onSelect={onSelect} />
),
with_keywords: ({ onSelect }) => (
  <KeywordCommandEngine onSelect={onSelect} />
),
with_cast: ({ onSelect }) => (
  <CastCommandEngine onSelect={onSelect} /> // Replace with CastCommandEngine if you have one
),
// Add more mappings here...
};