import { Tag, Wrap, Box, Badge } from "@chakra-ui/react"
import { ComboboxItemProp } from "./interfaces/combobox-item"

interface ComboTagsGroupedProps {
  items: ComboboxItemProp[];
  operators: ('and' | 'or')[]; // operators[i] is between items[i] and items[i+1], always present
  onOperatorToggle: (index: number) => void;
  onRemoveTag: (item: ComboboxItemProp) => void;
  colorPalette: string;
}

export default function ComboTagsGrouped({
  items,
  operators,
  onOperatorToggle,
  onRemoveTag,
  colorPalette
}: ComboTagsGroupedProps) {
  if (items.length === 0) return null;

  return (
    <Wrap gap="2" mt={2} alignItems="center">
      {items.map((item, index) => {
        const operator = index < items.length - 1 ? operators[index] : null;

        return (
          <Box key={`${item.id || item.value}-${index}`} display="flex" alignItems="center" gap="2">
            <Tag.Root colorPalette={colorPalette}>
              <Tag.Label>{item.name}</Tag.Label>
              <Tag.EndElement>
                <Tag.CloseTrigger onClick={() => onRemoveTag(item)} />
              </Tag.EndElement>
            </Tag.Root>
            
            {operator && (
              <Badge
                colorPalette={colorPalette}
                cursor="pointer"
                userSelect="none"
                onClick={() => onOperatorToggle(index)}
                px={2}
                py={1}
                fontSize="xs"
                fontWeight="bold"
                textTransform="uppercase"
                _hover={{
                  opacity: 0.8,
                  transform: 'scale(1.05)'
                }}
                transition="all 0.2s"
              >
                {operator}
              </Badge>
            )}
          </Box>
        );
      })}
    </Wrap>
  );
}

