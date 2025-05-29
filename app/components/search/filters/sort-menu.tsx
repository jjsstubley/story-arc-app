import { createListCollection, Portal, Select } from "@chakra-ui/react";

const SortMenu = ({value, onChange} : {value: string, onChange: (value: string[]) => void;}) => {
  return (
    <Select.Root variant="outline" collection={frameworks} defaultValue={[value]} onValueChange={(e) => onChange(e.value)}>
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder="Most Popular" />
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
    { label: "Most Popular", value: "popularity.desc" },
    { label: "Highest rated", value: "vote_average.desc" },
    { label: "Most Recent", value: "primary_release_date.desc" },
  ],
})

export default SortMenu;