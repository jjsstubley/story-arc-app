import { Tag, Wrap } from "@chakra-ui/react"

export default function ComboTags({tags, colorPalette} : {tags: string[], colorPalette: string}) {
  
    return (
        <Wrap gap="2" mt={2}>
            {tags.map((tag) => (
                <Tag.Root colorPalette={colorPalette} key={tag}>
                    <Tag.Label>{tag}</Tag.Label>
                    <Tag.EndElement>
                        <Tag.CloseTrigger />
                    </Tag.EndElement>
                </Tag.Root>
            ))}
        </Wrap>
    );
  }