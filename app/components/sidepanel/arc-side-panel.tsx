import {  Accordion, Box, Heading, Stack, Text } from "@chakra-ui/react";
import { CountriesInterface, LanguagesInterface } from "~/interfaces/tmdb/configuration";
import { GenreInterface } from "~/interfaces/tmdb/genre";
import { FullProviderInterface } from "~/interfaces/tmdb/provider";
import { CiSearch } from "react-icons/ci";
import { Session } from "@supabase/supabase-js";
import { UserAccountDropdown } from "~/components/ui/user-account-dropdown";
import DiscoverNavSection from "./sections/discover-nav-section";
import { WatchlistInterface } from "~/interfaces/watchlist";
import { PersonSummaryForInterface } from "~/interfaces/tmdb/people/summary";
import { LiaCompass } from "react-icons/lia";
import SearchNavSection from "./sections/search-nav-section";
import LibraryNavSection from "./sections/library-nav-section";
import { IoLibrary } from "react-icons/io5";
import { CollectionsInterface } from "~/interfaces/collections";

interface RequestFilterProps {
  key: string,
  type: string,
  name?: string[],
  value: number | string
}

interface FilterOptionsProps {
  genres: GenreInterface[], 
  providers: FullProviderInterface[], 
  people: PersonSummaryForInterface[], 
  regions: CountriesInterface[], 
  languages: LanguagesInterface[]
  defaults?: RequestFilterProps[]
  sort_by?: string
  collections?: { id: string, name: string }[]
  watchlists?: WatchlistInterface[]
  userCollections?: CollectionsInterface[]
}

const ArcSidePanel = ({filters, session} : {filters: FilterOptionsProps, session: Session | null}) => {
  
  const sections = [
    {
      label: "Discover",
      value: "discover",
      description: "Collections, Genres, and Stars",
      icon: <LiaCompass color="orange" size={20} />, 
      color: {
        default: "orange.900/30",
        hover: "orange.900/80",
      },
      content: <DiscoverNavSection collections={filters.collections || []} genres={filters.genres} people={filters.people} />
    },
    ...(session ? [{
      label: "Your Stuff",
      value: "library",
      description: "Your watchlist, collections, and more",
      icon: <IoLibrary color="orange" size={20} />,
      color: {
        default: "blue.900/30",
        hover: "blue.900/80",
      },
      content: <LibraryNavSection watchlists={filters.watchlists || []} />
    }] : []),
    {
      label: "Browse",
      value: "search",
      description: "Search by title, filters, or description",
      icon: <CiSearch color="orange" size={20} />, 
      color: {
        default: "green.900/30",
        hover: "green.900/80",
      },
      content: <SearchNavSection genres={filters.genres} providers={filters.providers} people={filters.people} regions={filters.regions} languages={filters.languages} defaults={filters.defaults} sort_by={filters.sort_by} />
    },
  ]       
  return (
    <Box as="nav" w={{ base: "100%", md: "25%" }} minWidth="300px" height="calc(100vh - 100px)" overflow="hidden" display="flex" flexDirection="column">
      <Box flex="1" mt={2} overflow="hidden" display="flex" flexDirection="column">
        <Accordion.Root defaultValue={["search"]} spaceY={2} height="100%" >
            {sections.map((section) => (
                <Accordion.Item key={section.value} value={section.value}  bgColor="bg.muted" rounded="lg"  w="full">
                    <Accordion.ItemTrigger p={0} >
                      <Box bg={section.color.default} _hover={{ bg: section.color.hover, cursor: "pointer" }} rounded="lg" w="full" shadow="md">
                        <Stack gap="1" p={4}>
                            <Box display="flex" gap={4} alignItems="center">
                            {section.icon}
                            <Heading as="h3" color="white" size="lg"> {section.label} </Heading>
                            </Box>
                            <Text fontSize="xs" color="fg.muted">{section.description}</Text>
                        </Stack>
                      </Box>
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent>
                        <Accordion.ItemBody>
                            <Box 
                              maxHeight="calc(100vh - 471px)" // Account for header and account section
                              overflowY="auto"
                              px={4}
                              // pr={2} // Padding for scrollbar
                            >
                              <Box mt={2}>
                                {section.content}
                              </Box>
                            </Box>
                        </Accordion.ItemBody>
                    </Accordion.ItemContent>
                </Accordion.Item>
            ))}
        </Accordion.Root>
      </Box>
      {/* Account section - fixed at bottom */}
      {session && (
        <Box 
          flexShrink={0}
          mt={2}
          borderColor="gray.200" 
          _dark={{ borderColor: "gray.700" }}
          bg="bg.muted"
          rounded="lg"
        >
          <UserAccountDropdown 
            user={session.user} 
            onSignOut={() => {}} 
            className="user-account-dropdown" 
          />
        </Box>
      )}
    </Box>
  );
};

export default ArcSidePanel;