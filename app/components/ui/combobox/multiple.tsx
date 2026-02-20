"use client"

import {
  Combobox,
  Portal,
  createListCollection,
  InputGroup,
  Box,
} from "@chakra-ui/react"
import { ReactNode, useMemo, useState, useEffect } from "react"
import { ComboboxItemProp } from "./interfaces/combobox-item";
import { BaseComboboxProps } from "./interfaces/combobox";
import ComboTags from "./combo-tags";

interface ComboboxProps extends BaseComboboxProps {
    onSelect: (details: Combobox.ValueChangeDetails  | null) => void;
    children?: (item: ComboboxItemProp, selected: string[]) => ReactNode
    colorPalette?: string
    defaultTags?: string[]
    disabled?: boolean
    hideTags?: boolean
}

export const MultipleCombobox = ({ 
    suggestions, 
    onSelect, 
    startElement, 
    placeholder = "Type to search", 
    defaultOpen = true, 
    children, 
    colorPalette='orange', 
    defaultTags,
    disabled=false,
    hideTags=false
   }: ComboboxProps
) => {
  const [searchValue, setSearchValue] = useState("")
  const [tags, setTags] = useState<string[]>(defaultTags ?? [])
  const [tagItems, setTagItems] = useState<ComboboxItemProp[]>([])

  const filteredItems = useMemo(
    () =>
      suggestions.filter((item) =>
        item.name.toLowerCase().includes(searchValue.toLowerCase()),
      ),
    [searchValue, suggestions],
  )

  const collection = useMemo(
    () => createListCollection({ items: filteredItems }),
    [filteredItems],
  )

  const handleValueChange = (details: Combobox.ValueChangeDetails) => {
    console.log('handleValueChange details', details)
    console.log('defaultTags', defaultTags)
    setTags(details.value)
    setTagItems(details.items)
    onSelect(details)
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    const updatedItems = tagItems.filter((item) => item.value !== tagToRemove)
    setTags(newTags);
    setTagItems(updatedItems)
  
    const details: Combobox.ValueChangeDetails = {
      value: newTags,
      items: updatedItems,
    };

    console.log('detauils', details)
    onSelect(details);
  };

  // Sync tags from defaultTags whenever it changes
  // This ensures the combobox always reflects the command engine's flatTags state
  useEffect(() => {
    if (defaultTags !== undefined) {
      setTags(defaultTags);
      // Convert defaultTags strings to ComboboxItemProp format by finding matching items in suggestions
      const matchedItems: ComboboxItemProp[] = defaultTags
        .map(tag => {
          const foundItem = suggestions.find(item => item.name === tag);
          return foundItem || { id: 0, name: tag, value: tag };
        })
        .filter((item): item is ComboboxItemProp => item !== null);
      setTagItems(matchedItems);
    }
  }, [defaultTags, suggestions]);


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
      disabled={disabled} 
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
        <Combobox.Positioner>
          <Combobox.Content>
            <Combobox.Empty>No items found</Combobox.Empty>
            {collection.items.map((item) => (
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
            ))}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
      {!hideTags && (
        <ComboTags 
          tags={tags} 
          colorPalette={colorPalette} 
          onRemoveTag={handleRemoveTag}
        />
      )}
    </Combobox.Root>
  )
}
