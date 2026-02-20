"use client"

import {
  Combobox,
  Portal,
  InputGroup,
  Box,
  useListCollection,
  useFilter,
  Span,
  HStack,
  Spinner,
} from "@chakra-ui/react"
import { ReactNode, useEffect, useState } from "react"
import { ComboboxItemProp } from "./interfaces/combobox-item";
import { BaseComboboxProps } from "./interfaces/combobox";
import ComboTags from "./combo-tags";


interface ComboboxProps extends BaseComboboxProps {
    onSelect: (details: Combobox.ValueChangeDetails | null) => void;
    children?: (item: ComboboxItemProp, selected: string[]) => ReactNode
    fetchUrl?: string
    colorPalette?: string
    defaultTags?: string[]
    hideTags?: boolean
}

export const AsyncMultipleCombobox = ({ suggestions, onSelect, startElement, placeholder = "Type to search", defaultOpen = false, children, fetchUrl, colorPalette="orange", defaultTags, hideTags=false }: ComboboxProps) => {
  const [searchValue, setSearchValue] = useState("")
  const [tags, setTags] = useState<string[]>(defaultTags ?? [])
  const [tagItems, setTagItems] = useState<ComboboxItemProp[]>([])
  const { contains } = useFilter({ sensitivity: "base" });
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  console.log('AsyncMultipleCombobox suggestions', suggestions)
  const { collection, set } = useListCollection({
    initialItems: suggestions,
    filter: contains,
    itemToString: (item) => item.name,
  });

  // Sync tags when defaultTags changes
  useEffect(() => {
    if (defaultTags) {
      setTags(defaultTags);
      // Convert defaultTags strings to ComboboxItemProp format
      setTagItems(defaultTags.map(tag => ({ id: parseInt(tag), name: tag, value: tag })));
    }
  }, [defaultTags]);

  // useEffect(() => {
  //   filter(searchValue);
  // }, [searchValue, filter]);

  const handleValueChange = (details: Combobox.ValueChangeDetails) => {
    setTags(details.value)
    setTagItems(details.items)
    onSelect(details)
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    const updatedItems = tagItems.filter((item) => item.value !== tagToRemove);
    setTags(newTags);
    setTagItems(updatedItems);
  
    const details: Combobox.ValueChangeDetails = {
      value: newTags,
      items: updatedItems,
    };

    console.log('detauils', details)
    onSelect(details);
  };

  async function getCollection() {
    if (!searchValue) return;
    setLoading(true)
    setError(false)

    const response = await fetch(`${fetchUrl}?query=${encodeURIComponent(searchValue)}&page=1`) // TODO: have the query passed down if possible or shift logic back up to parent
    const data = await response.json()
    console.log('getCollection data', data)
    // if (!response.ok) setError(data.error)
    const items = data.results.map((k: { name?: string; title?: string; id: number }) => ({
      id: k.id,
      name: k.name || k.title,
      value: k.name || k.title,
    }))

    set(items)
    setLoading(false)
  }

  useEffect(() => {
    if (!searchValue) {
      set(suggestions); // reset to initial items if input is cleared
      return;
    }
  
    const handler = setTimeout(() => {
      if (fetchUrl) {
        getCollection(); // async fetch from API
      } else {
        collection.filter((item) => contains(item, searchValue)); // local filter on suggestions
      }
    }, 300);
  
    return () => clearTimeout(handler);
  }, [searchValue])

  return (
    <Combobox.Root
      collection={collection}
      onInputValueChange={(details) => setSearchValue(details.inputValue)}
      defaultValue={defaultTags}
      value={tags}
      onValueChange={handleValueChange}
      width="100%"
      openOnClick
      defaultOpen={defaultOpen}
    //   closeOnSelect
      multiple
    >
      <Combobox.Control>
        <InputGroup flex="1" startAddon={startElement}>
            <Combobox.Input placeholder={placeholder} onKeyDown={(e) => {
                if(e.key === 'Backspace' && e.currentTarget.selectionStart === 0 && e.currentTarget.selectionEnd === 0) { 
                  onSelect(null)
                }
            }}/>
        </InputGroup>
        <Combobox.IndicatorGroup>
          <Combobox.ClearTrigger />
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      <Portal>
        <Combobox.Positioner style={{ zIndex: 1500 }}>
          <Combobox.Content style={{ zIndex: 1500 }}>
            <Combobox.Empty>No items found</Combobox.Empty>
            {loading ? (
              <HStack p="2">
                <Spinner size="xs" borderWidth="1px" />
                <Span>Loading...</Span>
              </HStack>
            ) : error ? (
              <Span p="2" color="fg.error">
                Error fetching
              </Span>
            ) : (
              collection.items.map((item) => (
                <Combobox.Item item={item} key={item.name}>
                      {children ? (
                          children(item, tags)
                      ) : (
                      <Box
                          p={2}
                          display="flex"
                          flexDirection="column"
                          rounded="md"
                          width="100%"
                          // _hover={{ bg: "gray.900" }}
                          cursor="pointer"
                      >
                          <strong>{item.name}</strong>
                      </Box>
                      )}
                  <Combobox.ItemIndicator />
                </Combobox.Item>
            )))}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
      {!hideTags && (
        <ComboTags tags={tags} colorPalette={colorPalette} onRemoveTag={handleRemoveTag} />
      )}
    </Combobox.Root>
  )
}
