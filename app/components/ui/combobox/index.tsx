"use client"

import {
  Combobox,
  Portal,
  useFilter,
  useListCollection,
  InputGroup,
  Box,
  HStack,
  For,
  Badge,
} from "@chakra-ui/react"
import { ReactNode, useState } from "react"
import { ComboboxItemProp } from "./interfaces/combobox-item";
import { BaseComboboxProps } from "./interfaces/combobox";


interface ComboboxProps extends BaseComboboxProps {
    onSelect: (details: Combobox.ValueChangeDetails | null) => void;
    children?: (item: ComboboxItemProp) => ReactNode
    colorPalette?: string
    defaultTags?: string[]
}

export const CommandCombobox = ({ 
  suggestions, onSelect, 
  startElement = '/', 
  placeholder = "Type to search", 
  defaultOpen = true, 
  children, 
  colorPalette='orange', 
  defaultTags  }: ComboboxProps) => {

    const [value, setValue] = useState<string[]>([])
    const { contains } = useFilter({ sensitivity: "base" })
    const { collection, filter } = useListCollection({
      initialItems: suggestions,
      filter: contains,
    })

    return (
      <Combobox.Root
        collection={collection}
        onInputValueChange={(e) => filter(e.inputValue)}
        value={value}
        onValueChange={(e) => {
          setValue(e.value)
          const selectedItem = collection.items.find((item) => item.value === e.value[0]);
          if (selectedItem) {
            onSelect(e);
          }
      }}
        width="100%"
        openOnClick
        defaultOpen={defaultOpen}
      >
        <Combobox.Control>
          <InputGroup startElement={startElement}>
              <Combobox.Input placeholder={placeholder} onKeyDown={(e) => {
                  console.log('e', e)
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
                <Combobox.Item item={item} key={item.value}>
                      {children ? (
                          children(item)
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
                          <small>{item.description}</small>
                      </Box>
                      )}
                  <Combobox.ItemIndicator />
                </Combobox.Item>
              ))}
            </Combobox.Content>
          </Combobox.Positioner>
        </Portal>
        <HStack>
          <For each={value} fallback="N/A">
            {(v) => <Badge key={v} colorPalette={colorPalette}>{v}</Badge>}
          </For>
        </HStack>
      </Combobox.Root>
    )
}
