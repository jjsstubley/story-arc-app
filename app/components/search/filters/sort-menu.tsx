import { createListCollection, Portal, Select } from "@chakra-ui/react";

const SortMenu = ({value, label, onChange} : {value: string, label?: string, onChange: (value: string[]) => void;}) => {
  return (
    <Select.Root variant="outline" collection={frameworks} defaultValue={[value]} onValueChange={(e) => onChange(e.value)}>
      <Select.HiddenSelect />
      { label && (<Select.Label mb={2}>{label}</Select.Label>)}
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder="Most popular" />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {frameworks.items.map((framework: {label: string, value: string}) => (
              <Select.Item item={framework} key={framework.value}>
                {framework.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
};

const frameworks = createListCollection({
  items: [
    { label: "Most popular", value: "popularity.desc" },
    { label: "Highest rated", value: "vote_average.desc" },
    { label: "Most rated", value: "vote_count.desc" },
    { label: "Most recent", value: "primary_release_date.desc" },
  ],
})

export default SortMenu;