import { Box } from "@chakra-ui/react";
import { CommandCombobox } from "../../ui/combobox";


interface suggestionsInterface {
  id?: number,
  name: string,
  value: string,
  description?: string
}

const SlashCommandEngine = ({ onSelect }: { onSelect: (item: suggestionsInterface | null) => void }) => {
  const commandFields = [
    { id: 1, name: "with_keywords", value: "with_keywords", description: 'Search for themes from a large collection of keywords. Use a comma (AND) or pipe (OR) for complex filtering' },
    { id: 2, name: "with_genres", value: "with_genres", description: 'Search for base genres from a set list. Use a comma (AND) or pipe (OR) for complex filtering' },
    { id: 3, name: "with_cast", value: "with_cast", description: 'blah blah Blah' },
    // ... etc.
  ]
  return (
    <CommandCombobox suggestions={commandFields} onSelect={onSelect}>
      {(item) => (
        <Box
          p={2}
          display="flex"
          flexDirection="column"
          rounded="md"
          width="100%"
          cursor="pointer"
        >
          <strong>{item.name}</strong>
          <small>{item.description}</small>
        </Box>
      )}
    </CommandCombobox>
  );
};

export default SlashCommandEngine;