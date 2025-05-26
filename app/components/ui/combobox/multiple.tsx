"use client"

import {
  Combobox,
  Portal,
  createListCollection,
  InputGroup,
  Box,
  Wrap,
  Badge,
} from "@chakra-ui/react"
import { ReactNode, useMemo, useState } from "react"
import { ComboboxItemProp } from "./interfaces/combobox-item";
import { BaseComboboxProps } from "./interfaces/combobox";

interface ComboboxProps extends BaseComboboxProps {
    onSelect: (details: Combobox.ValueChangeDetails  | null) => void;
    children?: (item: ComboboxItemProp, selected: string[]) => ReactNode
}

export const MultipleCombobox = ({ suggestions, onSelect, startElement, placeholder = "Type to search", defaultOpen = true, children }: ComboboxProps) => {
  const [searchValue, setSearchValue] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

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
    setSelectedSkills(details.value)
    onSelect(details)
  }

  return (
    <Combobox.Root
      collection={collection}
      onInputValueChange={(details) => setSearchValue(details.inputValue)}
      value={selectedSkills}
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
        <Combobox.Positioner>
          <Combobox.Content>
            <Combobox.Empty>No items found</Combobox.Empty>
            {collection.items.map((item) => (
              <Combobox.Item item={item} key={item.name}>
                    {children ? (
                        children(item, selectedSkills)
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
                        internal multiple
                    </Box>
                    )}
                <Combobox.ItemIndicator />
              </Combobox.Item>
            ))}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
      <Wrap gap="2" mt={4}>
        {selectedSkills.map((skill) => (
          <Badge colorPalette="orange" key={skill}>{skill}</Badge>
        ))}
      </Wrap>
    </Combobox.Root>
  )
}
