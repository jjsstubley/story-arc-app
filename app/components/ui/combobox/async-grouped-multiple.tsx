"use client"

import {
  Combobox,
  Portal,
  InputGroup,
  Box,
  Wrap,
  Badge,
  useListCollection,
  useFilter,
  Span,
  HStack,
  Spinner,
} from "@chakra-ui/react"
import { ReactNode, useEffect, useState } from "react"
import { ComboboxItemProp } from "./interfaces/combobox-item";
import { BaseComboboxProps } from "./interfaces/combobox";


interface ComboboxProps extends BaseComboboxProps {
    onSelect: (details: Combobox.ValueChangeDetails | null) => void;
    children?: (item: ComboboxItemProp, selected: string[]) => ReactNode
    fetchUrl?: string
}

export const AsyncGroupedMultipleCombobox = ({ suggestions, onSelect, startElement, placeholder = "Type to search", defaultOpen = true, children, fetchUrl }: ComboboxProps) => {
  const [searchValue, setSearchValue] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const { contains } = useFilter({ sensitivity: "base" });
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const { collection, set } = useListCollection({
    initialItems: suggestions,
    filter: contains,
  });

  // useEffect(() => {
  //   filter(searchValue);
  // }, [searchValue, filter]);

  const handleValueChange = (details: Combobox.ValueChangeDetails) => {
    setSelectedSkills(details.value)
    onSelect(details)
  }

  async function getCollection() {
    if (!searchValue) return;
    setLoading(true)
    setError(false)

    const [ titlesRes, keywordsRes ] = await Promise.all([
      await fetch(`${fetchUrl}?query=${encodeURIComponent(searchValue)}&page=1`),
      await fetch(`/resources/cast?query=${encodeURIComponent(searchValue)}&page=1`)
    ])

    const [keywords, titles] = await Promise.all([
      keywordsRes.json(),
      titlesRes.json()
    ]);

    const keywordItems = (keywords.results || []).map((k: { name: string; id: number }) => ({
      id: k.id,
      name: k.name,
      value: k.name,
      group: 'keywords'
    })).slice(0, 5);

    const titleItems = (titles.results || []).map((t: { name: string; id: number }) => ({
      id: t.id,
      name: t.name,
      value: t.name,
      group: 'cast'
    })).slice(0, 5);

    // const response = await fetch(`${fetchUrl}?query=${encodeURIComponent(searchValue)}&page=1`) // TODO: have the query passed down if possible or shift logic back up to parent
    // const data = await response.json()
    // // if (!response.ok) setError(data.error)
    // const items = data.results.map((k: { name: string; id: number }) => ({
    //   id: k.id,
    //   name: k.name,
    //   value: k.name,
    // }))

    set([...keywordItems, ...titleItems ])
    setLoading(false)
  }

  useEffect(() => {
    if (!searchValue) return;

    const handler = setTimeout(() => {
      getCollection();
    }, 300); // 300ms debounce delay
  
    return () => {
      clearTimeout(handler); // Clean up timeout on unmount or value change
    };
  }, [searchValue])

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
              <>
              <Combobox.ItemGroup>
                <Combobox.ItemGroupLabel>Keywords</Combobox.ItemGroupLabel>
                {
                  collection.items.filter((i) => i.group === 'keywords').map((item) => (
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
                          </Box>
                          )}
                      <Combobox.ItemIndicator />
                    </Combobox.Item>
                
                  ))
                }
              </Combobox.ItemGroup>
              <Combobox.ItemGroup>
                <Combobox.ItemGroupLabel>Cast</Combobox.ItemGroupLabel>
                {
                  collection.items.filter((i) => i.group === 'cast').map((item) => (
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
                          </Box>
                          )}
                      <Combobox.ItemIndicator />
                    </Combobox.Item>
                
                  ))
                }
              </Combobox.ItemGroup>
              </>
            )}
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
