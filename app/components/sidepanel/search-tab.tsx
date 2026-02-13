
import { GenreInterface } from "~/interfaces/tmdb/genre";
import { FullProviderInterface } from "~/interfaces/tmdb/provider";
import { CountriesInterface, LanguagesInterface } from "~/interfaces/tmdb/configuration";


import FilterSearch from "../search/filter-search";
import { Accordion, Box, Heading, Stack, Text } from "@chakra-ui/react";
import { MdOutlineTitle } from "react-icons/md";
import TitleCommandEngine from "../search/CommandEngines/title";
import { LuFilter } from "react-icons/lu";
import { IoSparklesOutline } from "react-icons/io5";
import SuggestionsInput from "../search/suggestions";
import { PersonSummaryForInterface } from "~/interfaces/tmdb/people/summary";

interface FilterOptionsProps {
    genres: GenreInterface[], 
    providers: FullProviderInterface[], 
    people: PersonSummaryForInterface[], 
    regions: CountriesInterface[], 
    languages: LanguagesInterface[]
    defaults?: RequestFilterProps[]
    sort_by?: string
}

interface RequestFilterProps {
    key: string,
    type: string,
    name?: string[],
    value: number | string
    disabled?: boolean
  }

const SearchTab = ({genres, providers, people, regions, languages, defaults, sort_by} : FilterOptionsProps) => {
  const sections = [
    {
      title: "By Title",
      value: "title",
      description: "Know a movie or tv show? Search here",
      icon: <MdOutlineTitle color="whiteAlpha.600" />,
      content: <TitleCommandEngine />
    },
    {
      title: "By Filters",
      value: "filters",
      description: "Browse from selected filters",
      icon: <LuFilter color="whiteAlpha.600" />,
      content: <FilterSearch genres={genres} providers={providers} people={people} regions={regions} languages={languages} defaults={defaults} sort_by={sort_by} />
    },
    {
      title: "By Description",
      value: "description",
      description: "Search for recommendations by natural language",
      icon: <IoSparklesOutline color="whiteAlpha.600" />,
      content: <SuggestionsInput />
    }
  ]       
  return (
    <Box display="flex" flexDirection="column" gap={4} mb={8}>
      <Box>
        <Text fontSize="xs" color="fg.muted" pb={4}>Find</Text>
        <Accordion.Root collapsible multiple defaultValue={["title"]}>
          {sections.map((section) => (
            <Accordion.Item key={section.value} value={section.value}>
              <Accordion.ItemTrigger>
                <Stack gap="1">
                  <Box display="flex" gap={4} alignItems="center">
                    {section.icon}
                    <Heading as="h3" color="whiteAlpha.600" size="sm"> {section.title} </Heading>
                  </Box>
                  <Text fontSize="xs" color="fg.muted">{section.description}</Text>
                </Stack>
              </Accordion.ItemTrigger>
              <Accordion.ItemContent>
                <Accordion.ItemBody>
                  {section.content}
                </Accordion.ItemBody>
              </Accordion.ItemContent>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </Box>
    </Box>
  );
};

export default SearchTab;