import { useEffect, useState, useRef } from "react";
import { AsyncMultipleCombobox } from "~/components/ui/combobox/async-multiple";
import ComboTags from "~/components/ui/combobox/combo-tags";
import { Box, Combobox, SegmentGroup } from "@chakra-ui/react";
import { RequestFilterProps } from "~/components/search/filter-search";
import { ComboboxItemProp } from "~/components/ui/combobox/interfaces/combobox-item";

interface ConfigProps { 
  type: string;
  key: string;
  name: string[],
  value: string;
}

const CompanyCommandEngine = ({ onSelect, defaults, defaultValue, withoutDefaults, withoutDefaultValue }: { 
  onSelect: (payload: ConfigProps) => void, 
  defaults?: string[],
  defaultValue?: RequestFilterProps,
  withoutDefaults?: string[],
  withoutDefaultValue?: RequestFilterProps
}) => {
  const [mode, setMode] = useState<'Include' | 'Exclude'>('Include');
  const [items, setItems] = useState<ComboboxItemProp[]>([]);
  const [flatTags, setFlatTags] = useState<string[]>([]);
  const isInitializedRef = useRef<boolean>(false);
  const lastModeRef = useRef<'Include' | 'Exclude'>(mode);

  // Initialize items from defaults based on mode (only on initial mount or mode change)
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
        // Parse pipe-separated IDs: "123|456|789"
        const ids = currentDefaultValue.value.split('|').filter(id => id.trim() !== '').map(id => parseInt(id.trim()));
        const names = currentDefaultValue.name || [];
        
        const newItems: ComboboxItemProp[] = ids.map((id, index) => ({
          id: id,
          name: names[index] || `Company ${id}`,
          value: names[index] || `Company ${id}`
        }));
        
        setItems(newItems);
        setFlatTags(newItems.map(i => i.name));
      } else if (currentDefaults && currentDefaults.length > 0) {
        // Fallback: use defaults as flat list
        setFlatTags(currentDefaults);
        const newItems: ComboboxItemProp[] = currentDefaults.map((name, index) => {
          // Try to extract ID from name if it's in format "Name|ID" or just use index
          const parts = name.split('|');
          const id = parts.length > 1 ? parseInt(parts[1]) : index;
          return {
            id: id,
            name: parts[0] || name,
            value: parts[0] || name
          };
        });
        
        setItems(newItems);
      } else {
        // Clear if no defaults for current mode
        setItems([]);
        setFlatTags([]);
      }
      isInitializedRef.current = true;
    }
  }, [mode, defaultValue, defaults, withoutDefaultValue, withoutDefaults]);

  function handleOnSubmit(details: Combobox.ValueChangeDetails | null) { 
    const filterKey = mode === 'Include' ? 'with_companies' : 'without_companies';
    
    if (!details) {
      setItems([]);
      setFlatTags([]);
      onSelect({
        type: 'company',
        key: filterKey,
        name: [],
        value: ''
      });
      return;
    }

    // Update items
    const newItems = details.items || [];
    setItems(newItems);
    setFlatTags(details.value || []);

    // Format as pipe-separated IDs (like CastCommandEngine)
    const transformedValues = newItems.map((item) => item.id).join('|') || '';

    const newConfig = {
      type: 'company',
      key: filterKey,
      name: details.value || [],
      value: transformedValues
    };
    onSelect(newConfig);
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const filterKey = mode === 'Include' ? 'with_companies' : 'without_companies';
    const newItems = items.filter((item) => item.value !== tagToRemove);
    const newTags = flatTags.filter((tag) => tag !== tagToRemove);
    
    setItems(newItems);
    setFlatTags(newTags);
    
    // Format as pipe-separated IDs
    const transformedValues = newItems.map((item) => item.id).join('|') || '';
    
    onSelect({
      type: 'company',
      key: filterKey,
      name: newTags,
      value: transformedValues
    });
  };

  const handleModeChange = (newMode: 'Include' | 'Exclude') => {
    setMode(newMode);
    // Clear current selections when switching modes
    setItems([]);
    setFlatTags([]);
  };

  const colorPalette = mode === 'Include' ? 'purple' : 'red';

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
      <AsyncMultipleCombobox 
        suggestions={[]} 
        onSelect={handleOnSubmit} 
        startElement="" 
        fetchUrl="/api/companies" 
        placeholder="Companies" 
        defaultOpen={false} 
        colorPalette={colorPalette} 
        defaultTags={flatTags}
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
      </AsyncMultipleCombobox>
      {items.length > 0 && (
        <ComboTags 
          tags={flatTags} 
          colorPalette={colorPalette} 
          onRemoveTag={handleRemoveTag}
        />
      )}
    </Box>
  );
};

export default CompanyCommandEngine;

