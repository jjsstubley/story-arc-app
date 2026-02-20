import { Tag, Box, Badge, Button, VStack, HStack, Text } from "@chakra-ui/react"
import { ComboboxItemProp } from "./interfaces/combobox-item"

interface Group {
  id: string;
  items: ComboboxItemProp[];
}

interface ComboTagsGroupsProps {
  groups: Group[];
  onRemoveTag: (groupId: string, item: ComboboxItemProp) => void;
  onMoveToGroup: (item: ComboboxItemProp, fromGroupId: string, toGroupId: string) => void;
  onAddGroup: () => void;
  onRemoveGroup: (groupId: string) => void;
  colorPalette: string;
}

export default function ComboTagsGroups({
  groups,
  onRemoveTag,
  onMoveToGroup,
  onAddGroup,
  onRemoveGroup,
  colorPalette
}: ComboTagsGroupsProps) {
  if (groups.length === 0) return null;

  return (
    <VStack gap={3} mt={2} alignItems="stretch">
      {groups.map((group, groupIndex) => (
        <Box key={group.id}>
          <HStack gap={2} alignItems="flex-start" flexWrap="wrap">
            {/* Group container */}
            <Box
              display="flex"
              flexWrap="wrap"
              gap={2}
              p={2}
              borderRadius="md"
              border="1px solid"
              borderColor={`${colorPalette}.200`}
              bg={`${colorPalette}.50`}
              flex="1"
              minW="200px"
            >
              {group.items.length === 0 ? (
                <Text fontSize="sm" color="gray.500" fontStyle="italic">
                  Empty group
                </Text>
              ) : (
                group.items.map((item, itemIndex) => (
                  <Box key={`${item.id || item.value}-${itemIndex}`} display="flex" alignItems="center" gap={1}>
                    <Tag.Root colorPalette={colorPalette}>
                      <Tag.Label>{item.name}</Tag.Label>
                      <Tag.EndElement>
                        <Tag.CloseTrigger onClick={() => onRemoveTag(group.id, item)} />
                      </Tag.EndElement>
                    </Tag.Root>
                    {itemIndex < group.items.length - 1 && (
                      <Badge
                        colorPalette={colorPalette}
                        fontSize="xs"
                        fontWeight="bold"
                        textTransform="uppercase"
                        px={1.5}
                        py={0.5}
                      >
                        AND
                      </Badge>
                    )}
                  </Box>
                ))
              )}
            </Box>

            {/* Group actions */}
            <VStack gap={1} alignItems="stretch">
              {groups.length > 1 && (
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => onRemoveGroup(group.id)}
                  colorPalette={colorPalette}
                >
                  Remove Group
                </Button>
              )}
            </VStack>

            {/* OR separator between groups */}
            {groupIndex < groups.length - 1 && (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                minW="60px"
                px={2}
              >
                <Badge
                  colorPalette={colorPalette}
                  fontSize="sm"
                  fontWeight="bold"
                  textTransform="uppercase"
                  px={3}
                  py={1}
                >
                  OR
                </Badge>
              </Box>
            )}
          </HStack>
        </Box>
      ))}

      {/* Add Group button */}
      <Button
        size="sm"
        variant="outline"
        onClick={onAddGroup}
        colorPalette={colorPalette}
        width="fit-content"
      >
        + Add Group
      </Button>
    </VStack>
  );
}

