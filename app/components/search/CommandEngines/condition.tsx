import { Box, Button, Combobox, Group, SegmentGroup } from "@chakra-ui/react";
import { MultipleCombobox } from "../../ui/combobox/multiple";
import { useEffect, useState } from "react";
import { ComboboxItemProp } from "~/components/ui/combobox/interfaces/combobox-item";
import { AsyncMultipleCombobox } from "~/components/ui/combobox/async-multiple";
import { AsyncGroupedMultipleCombobox } from "~/components/ui/combobox/async-grouped-multiple";
import { ExtendedValueChangeDetails } from "./interfaces/ExtendedValueChangeDetails";

interface ConditionCommandEngineProps {
  onSelect: (details: ExtendedValueChangeDetails | null) => void;
  suggestions: ComboboxItemProp[];
  startElement: React.ReactNode | string;
  async?: boolean;
  grouped?: boolean;
  fetchUrl?: string; // required if async is true
  addButton?: boolean; 
  placeholder?: string
  defaultOpen?: boolean
}

const ConditionCommandEngine = ({ onSelect, suggestions, startElement, async = false, grouped= false, fetchUrl, addButton=false, placeholder, defaultOpen }: ConditionCommandEngineProps) => {
  const [detailsObj, setDetailsObj] = useState<Combobox.ValueChangeDetails| null>(null)
  const [conditionValues, setConditionValues] = useState<Record<string, string>>({})

  const handleComboboxSelect = (details: Combobox.ValueChangeDetails | null) => {
    if (!details) {
      onSelect(null)
      return
    }
    setDetailsObj(details)
    const newConditions = { ...conditionValues }
    if (details) {
      for (const value of details.value) {
        if (!(value in newConditions)) {
          newConditions[value] = "or"
        }
      }
    }

    setConditionValues(newConditions)

  };

  const handleConditionChange = (itemValue: string, newValue: string) => {
    setConditionValues((prev) => {
      const updated = {
        ...prev,
        [itemValue]: newValue,
      };
      return updated;
    });
  };

  useEffect(() => {
    if(detailsObj && conditionValues) {
      handleSubmit()
    }
  }, [detailsObj, conditionValues])

  function handleSubmit() {
    onSelect({
      ...detailsObj as ExtendedValueChangeDetails,
      conditions: conditionValues,
    });
  }
  const ComboboxComponent = async ? grouped ? AsyncGroupedMultipleCombobox : AsyncMultipleCombobox : MultipleCombobox;
  return (
    <Group attached w="full" display="flex" alignItems="top">
      <ComboboxComponent suggestions={suggestions} onSelect={handleComboboxSelect} startElement={startElement} fetchUrl={fetchUrl} placeholder={placeholder} defaultOpen={defaultOpen}>
        {(item, selected) => {
          const isSelected = selected.includes(item.value)
          const conditionValue = conditionValues[item.value] ?? "or"
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
              {
                isSelected && (
                  <Box onClick={(e) => e.stopPropagation()}>
                    <SegmentGroup.Root size="xs" value={conditionValue} onValueChange={(e) => {
                      if (e.value !== null) {
                        handleConditionChange(item.value, e.value)
                      }
                    }}>
                      <SegmentGroup.Indicator />
                      <SegmentGroup.Items items={["or", "and"]} />
                    </SegmentGroup.Root>
                  </Box>
                )
              }
            </Box>
          )
        }}
      </ComboboxComponent>
      {
        addButton && (
          <Button bg="bg.subtle" variant="outline" onClick={handleSubmit}>
            Add
          </Button>
        )
      }
    </Group>
  );
};

export default ConditionCommandEngine;