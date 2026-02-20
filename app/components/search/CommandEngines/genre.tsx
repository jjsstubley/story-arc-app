
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { GenreInterface } from "~/interfaces/tmdb/genre";
import { ComboboxItemProp } from "~/components/ui/combobox/interfaces/combobox-item";
import { MultipleCombobox } from "~/components/ui/combobox/multiple";
import ComboTagsGrouped from "~/components/ui/combobox/combo-tags-grouped";
import { Box, Combobox, SegmentGroup } from "@chakra-ui/react";
import { parseGroupedValue, serializeGroupedValue } from "~/utils/helpers";
import { RequestFilterProps } from "~/components/search/filter-search";

interface ConfigProps { 
  type: string;
  key: string;
  name: string[],
  value: string;
}

const GenreCommandEngine = ({ onSelect, genres, defaults, disabled, defaultValue, withoutDefaults, withoutDefaultValue }: { 
  onSelect: (payload: ConfigProps) => void, 
  genres: GenreInterface[], 
  defaults?: string[], 
  disabled: boolean,
  defaultValue?: RequestFilterProps,
  withoutDefaults?: string[],
  withoutDefaultValue?: RequestFilterProps
}) => {
  const [mode, setMode] = useState<'Include' | 'Exclude'>('Include');
  const [genreFields, setGenreFields] = useState<ComboboxItemProp[]>([]);
  const [items, setItems] = useState<ComboboxItemProp[]>([]);
  const [operators, setOperators] = useState<('and' | 'or')[]>([]);
  const [flatTags, setFlatTags] = useState<string[]>([]);
  const isInitializedRef = useRef<boolean>(false);
  const lastModeRef = useRef<'Include' | 'Exclude'>(mode);

  // Create lookup map for genre IDs to names
  const genreMap = useMemo(() => {
    const map = new Map<number, GenreInterface>();
    genres.forEach(g => map.set(g.id, g));
    return map;
  }, [genres]);

  useEffect(() => {
    if (genres) {
      setGenreFields(genres.map((g: {id: number, name: string}) => ({
        id: g.id,
        name: g.name,
        value: g.name,
      })));
    }
  }, [genres]);

  // Convert groups to flat items + operators
  const groupsToItemsAndOperators = useCallback((groups: Array<{items: number[]}>): { items: ComboboxItemProp[], operators: ('and' | 'or')[] } => {
    const flatItems: ComboboxItemProp[] = [];
    const flatOperators: ('and' | 'or')[] = [];
    
    groups.forEach((group, groupIndex) => {
      // Add items from this group
      group.items.forEach(id => {
        const genre = genreMap.get(id);
        if (genre) {
          flatItems.push({
            id: genre.id,
            name: genre.name,
            value: genre.name
          });
        }
      });
      
      // Add operators: AND between items in same group, OR between groups
      if (group.items.length > 1) {
        // Add AND operators between items in the same group
        for (let i = 0; i < group.items.length - 1; i++) {
          flatOperators.push('and');
        }
      }
      
      // Add OR operator between groups (except after last group)
      if (groupIndex < groups.length - 1) {
        flatOperators.push('or');
      }
    });
    
    return { items: flatItems, operators: flatOperators };
  }, [genreMap]);

  // Convert flat items + operators to groups for serialization
  const itemsAndOperatorsToGroups = (items: ComboboxItemProp[], operators: ('and' | 'or')[]): Array<{items: number[]}> => {
    if (items.length === 0) return [];
    
    const groups: Array<{items: number[]}> = [];
    let currentGroup: number[] = [];
    
    items.forEach((item, index) => {
      if (item.id) {
        currentGroup.push(item.id);
      }
      
      // Check if we should end the current group
      const operator = operators[index];
      if (operator === 'or' || index === items.length - 1) {
        if (currentGroup.length > 0) {
          groups.push({ items: currentGroup });
          currentGroup = [];
        }
      }
    });
    
    return groups;
  };

  // Initialize items and operators from defaults based on mode (only on initial mount or mode change)
  // After initialization, local state is the source of truth
  useEffect(() => {
    // Reset initialization when mode changes
    if (lastModeRef.current !== mode) {
      isInitializedRef.current = false;
      lastModeRef.current = mode;
    }
    
    // Only sync from defaults on initial mount or when mode changes
    // After initialization, don't overwrite state when defaults change due to URL updates
    if (!isInitializedRef.current) {
      const currentDefaults = mode === 'Include' ? defaults : withoutDefaults;
      const currentDefaultValue = mode === 'Include' ? defaultValue : withoutDefaultValue;
      
      if (currentDefaultValue?.value && typeof currentDefaultValue.value === 'string') {
        // Parse the grouped value string
        const parsed = parseGroupedValue(currentDefaultValue.value);
        const { items: newItems, operators: newOperators } = groupsToItemsAndOperators(parsed);
        setItems(newItems);
        setOperators(newOperators);
        setFlatTags(newItems.map(i => i.name));
      } else if (currentDefaults && currentDefaults.length > 0) {
        // Fallback: use defaults as flat list (all OR)
        setFlatTags(currentDefaults);
        const newItems: ComboboxItemProp[] = currentDefaults
          .map(name => {
            const genre = genres.find(g => g.name === name);
            return genre ? {
              id: genre.id,
              name: genre.name,
              value: genre.name
            } : null;
          })
          .filter((item): item is { id: number; name: string; value: string } => item !== null);
        
        setItems(newItems);
        // Default: all OR operators
        setOperators(newItems.length > 1 ? new Array(newItems.length - 1).fill('or') : []);
      } else {
        // Clear if no defaults for current mode
        setItems([]);
        setOperators([]);
        setFlatTags([]);
      }
      isInitializedRef.current = true;
    }
  }, [mode, defaultValue, defaults, withoutDefaultValue, withoutDefaults, genres, genreMap, groupsToItemsAndOperators]);


  function handleOnSubmit(details: Combobox.ValueChangeDetails | null) { 
    const filterKey = mode === 'Include' ? 'with_genres' : 'without_genres';
    
    if (!details) {
      setItems([]);
      setOperators([]);
      setFlatTags([]);
      onSelect({
        type: 'genre',
        key: filterKey,
        name: [],
        value: ''
      });
      return;
    }

    // Update items and preserve operators where possible
    const newItems = details.items || [];
    setItems(newItems);
    setFlatTags(details.value || []);

    // Preserve existing operators where possible, default to OR for new items
    const newOperators: ('and' | 'or')[] = [];
    if (newItems.length > 1) {
      // Try to match existing items to preserve operators
      for (let i = 0; i < newItems.length - 1; i++) {
        const currentItem = newItems[i];
        const nextItem = newItems[i + 1];
        
        // Find if these items were adjacent in the old list
        const currentIndex = items.findIndex(item => item.id === currentItem.id);
        const nextIndex = items.findIndex(item => item.id === nextItem.id);
        
        if (currentIndex !== -1 && nextIndex !== -1 && nextIndex === currentIndex + 1) {
          // Items were adjacent, preserve the operator
          newOperators.push(operators[currentIndex] || 'or');
        } else {
          // New items or not adjacent, default to OR
          newOperators.push('or');
        }
      }
    }
    
    setOperators(newOperators);

    // Serialize to grouped value format
    const groups = itemsAndOperatorsToGroups(newItems, newOperators);
    const serialized = serializeGroupedValue(groups);
    
    // Update state
    setItems(newItems);
    setOperators(newOperators);

    const newConfig = {
      type: 'genre',
      key: filterKey,
      name: details.value || [],
      value: serialized
    };
    onSelect(newConfig);
  }

  const handleRemoveTag = (item: ComboboxItemProp) => {
    const filterKey = mode === 'Include' ? 'with_genres' : 'without_genres';
    const itemIndex = items.findIndex(i => i.id === item.id && i.name === item.name);
    if (itemIndex === -1) return;
    
    const newItems = items.filter((_, index) => index !== itemIndex);
    const newOperators = operators.filter((_, index) => index !== itemIndex);
    
    // Adjust operators array length
    if (newItems.length > 0 && newOperators.length !== newItems.length - 1) {
      // Recalculate operators if needed
      const adjustedOperators: ('and' | 'or')[] = [];
      for (let i = 0; i < newItems.length - 1; i++) {
        if (i < newOperators.length) {
          adjustedOperators.push(newOperators[i]);
        } else {
          adjustedOperators.push('or'); // Default to OR
        }
      }
      setOperators(adjustedOperators);
    } else {
      setOperators(newOperators);
    }
    
    setItems(newItems);
    setFlatTags(newItems.map(i => i.name));
    
    // Serialize and update
    const groups = itemsAndOperatorsToGroups(newItems, newOperators);
    const serialized = serializeGroupedValue(groups);
    
    onSelect({
      type: 'genre',
      key: filterKey,
      name: newItems.map(i => i.name),
      value: serialized
    });
  };

  const handleOperatorToggle = (operatorIndex: number) => {
    const filterKey = mode === 'Include' ? 'with_genres' : 'without_genres';
    if (operatorIndex < 0 || operatorIndex >= operators.length) return;
    
    const newOperators = [...operators];
    newOperators[operatorIndex] = newOperators[operatorIndex] === 'or' ? 'and' : 'or';
    setOperators(newOperators);
    
    // Serialize and update
    const groups = itemsAndOperatorsToGroups(items, newOperators);
    const serialized = serializeGroupedValue(groups);
    
    onSelect({
      type: 'genre',
      key: filterKey,
      name: items.map(i => i.name),
      value: serialized
    });
  };

  const handleModeChange = (newMode: 'Include' | 'Exclude') => {
    setMode(newMode);
    // Clear current selections when switching modes
    setItems([]);
    setOperators([]);
    setFlatTags([]);
  };

  const colorPalette = mode === 'Include' ? 'orange' : 'red';

  return (
    <Box>
      <Box mb={2}>
        <SegmentGroup.Root 
          size="sm" 
          value={mode} 
          onValueChange={(e) => {
            if (e.value !== null) {
              handleModeChange(e.value as 'Include' | 'Exclude');
            }
          }}
        >
          <SegmentGroup.Indicator />
          <SegmentGroup.Items items={['Include', 'Exclude']} />
        </SegmentGroup.Root>
      </Box>
      <MultipleCombobox 
        suggestions={genreFields} 
        onSelect={handleOnSubmit} 
        startElement="" 
        placeholder="Genre" 
        defaultOpen={false} 
        defaultTags={flatTags} 
        disabled={disabled}
        hideTags={true}
      >
        {(item) => {
          return (
            <Box display="flex" justifyItems="space-between" width="100%" alignItems="center">
              <Box
                p={2}
                display="flex"
                flexDirection="column"
                rounded="md"
                width="100%"
                color="white"
                cursor="pointer"
              >
                <strong>{item.name}</strong>
              </Box>
            </Box>
          )
        }}
      </MultipleCombobox>
      {items.length > 0 && (
        <ComboTagsGrouped
          items={items}
          operators={operators}
          onOperatorToggle={handleOperatorToggle}
          onRemoveTag={handleRemoveTag}
          colorPalette={colorPalette}
        />
      )}
    </Box>
  );
};

export default GenreCommandEngine;