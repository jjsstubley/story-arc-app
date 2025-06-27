import { Tag, Wrap } from "@chakra-ui/react"

export default function ComboTags({tags, colorPalette, onRemoveTag} : {tags: string[], colorPalette: string, onRemove?: (tag: string) => void, onRemoveTag?: (tag: string) => void;}) {
  
    return (
        <Wrap gap="2" mt={2}>
            {tags.map((tag) => (
                <Tag.Root colorPalette={colorPalette} key={tag}>
                    <Tag.Label>{tag}</Tag.Label>
                    <Tag.EndElement>
                        <Tag.CloseTrigger  onClick={() => onRemoveTag?.(tag)}/>
                    </Tag.EndElement>
                </Tag.Root>
            ))}
        </Wrap>
    );
  }