import { Accordion, Group, RadioCard, Text } from "@chakra-ui/react"

export const PresetCards = () => {
  return (
    <Accordion.Root variant="enclosed" collapsible>
      {presets.map((item, index) => (
      <Accordion.Item key={index} value={item.value}>
        <Accordion.ItemTrigger>
          <Text flex="1" fontSize="sm">{item.title}</Text>
          <Accordion.ItemIndicator />
        </Accordion.ItemTrigger>
        <Accordion.ItemContent p={0}>
          <Accordion.ItemBody>
            <RadioCard.Root mt={4}>
              {/* <RadioCard.Label>Presets</RadioCard.Label> */}
              <Group attached orientation="vertical">
                {items.map((item) => (
                  <RadioCard.Item key={item.value} value={item.value} width="full">
                    <RadioCard.ItemHiddenInput />
                    <RadioCard.ItemControl>
                      <RadioCard.ItemContent>
                        <RadioCard.ItemText>{item.title}</RadioCard.ItemText>
                        <RadioCard.ItemDescription>
                          {item.description}
                        </RadioCard.ItemDescription>
                      </RadioCard.ItemContent>
                      <RadioCard.ItemIndicator />
                    </RadioCard.ItemControl>
                  </RadioCard.Item>
                ))}
              </Group>
            </RadioCard.Root>
          </Accordion.ItemBody>
        </Accordion.ItemContent>
      </Accordion.Item>
      ))}
  </Accordion.Root>
  )
}


const presets = [
  { value: "presets", title: "Presets" },
]

const items = [
  { value: "hidden_gems", title: "Hidden gems", description: "Movies that receive a good rating avg to count score" },
  { value: "critacally_acclaimed", title: "Critically Acclaimed", description: "Movies that receive a high rating and count score" },
  { value: "cult_films", title: "Cult films", description: "Films that have a following" },
]