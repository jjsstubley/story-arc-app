
import { GenreInterface } from "~/interfaces/tmdb/genre";
import { FullProviderInterface } from "~/interfaces/tmdb/provider";
import { CountriesInterface, LanguagesInterface } from "~/interfaces/tmdb/configuration";


import FilterSearch from "../../search/filter-search";
import { Box, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { MdOutlineTitle } from "react-icons/md";
import TitleCommandEngine from "../../search/CommandEngines/title";
import { LuFilter } from "react-icons/lu";
import { IoSparklesOutline } from "react-icons/io5";
import SuggestionsInput from "../../search/suggestions";
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

const SearchNavSection = ({genres, providers, people, regions, languages, defaults, sort_by} : FilterOptionsProps) => {
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
    <Box spaceY={4} position="relative">
      {sections.map((section) => (
        <Box key={section.value}>
            <Stack gap="1">
                <Box display="flex" gap={4} alignItems="center">
                {section.icon}
                <Heading as="h3" color="whiteAlpha.600" size="sm"> {section.title} </Heading>
                </Box>
                <Text fontSize="xs" color="fg.muted">{section.description}</Text>
            </Stack>
            <SimpleGrid columns={1} gap={4} padding={0} margin={0} mt={4} pl={4} borderLeft="1px solid" borderColor="gray.700">
              {section.content}
            </SimpleGrid>
        </Box>
      ))}
    </Box>
  );
};

export default SearchNavSection;

{/* <SimpleGrid columns={1} gap={4} padding={0} margin={0} pl={4} borderLeft="1px solid" borderColor="gray.700">
{people.slice(0, 10).map(person => (
  <Link to={`/credits/${slugify(person.name)}_${person.id}`} key={person.id}>
    <Box display="flex" gap={4} alignItems="center" fontSize="xs" rounded="md" p={2} py={1} _hover={
      { bg: 'gray.800', color: "orange.400", cursor: "pointer" }
    }>
      <Avatar.Root colorPalette="blue">
        <Avatar.Fallback name={person.name} />
        <Avatar.Image src={`https://image.tmdb.org/t/p/w300/${person.profile_path}`} />
      </Avatar.Root>
      <Heading as="h3" fontSize="xs">{person.name}</Heading>
    </Box>
  </Link>
))}
</SimpleGrid> */}