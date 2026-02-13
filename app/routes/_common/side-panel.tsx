import {  Box, Separator, Tabs, } from "@chakra-ui/react";
import { CountriesInterface, LanguagesInterface } from "~/interfaces/tmdb/configuration";
import { GenreInterface } from "~/interfaces/tmdb/genre";
import { FullProviderInterface } from "~/interfaces/tmdb/provider";
import { CiSearch } from "react-icons/ci";
import { LuSquareCheck } from "react-icons/lu";
import { Session } from "@supabase/supabase-js";
import { UserAccountDropdown } from "~/components/ui/user-account-dropdown";
import GoogleSignIn from "~/components/googleSignIn";
import HomeTab from "~/components/sidepanel/home-tab";
import LibraryTab from "~/components/sidepanel/library-tab";
import SearchTab from "~/components/sidepanel/search-tab";
import { WatchlistInterface } from "~/interfaces/watchlist";
import { PersonSummaryForInterface } from "~/interfaces/tmdb/people/summary";
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
}

const SidePanel = ({filters, session} : {filters: FilterOptionsProps, session: Session}) => {
  
  const tabs = [
    {
      label: "Search",
      value: "search",
      icon: <CiSearch />, 
      content: <>
        <HomeTab collections={filters.collections || []} genres={filters.genres} people={filters.people} />
        <SearchTab genres={filters.genres} providers={filters.providers} people={filters.people} regions={filters.regions} languages={filters.languages} defaults={filters.defaults} sort_by={filters.sort_by} />
      </>
    },
    {
      label: "Library",
      value: "library",
      icon: <LuSquareCheck />,
      content: <LibraryTab />
    }
  ]       
  return (
    <Box as="nav" w={{ base: "100%", md: "25%" }} minWidth="300px" bgColor="bg.muted" rounded="lg" overflow="hidden">
      {/* <Text>Sidebar</Text> */}
      <Tabs.Root defaultValue="home" variant="plain" size="sm" fitted>
        {/* <Box p={4}>
          <DynamicBreadcrumbs />
        </Box> */}
        <Box overflow="auto" height="calc(100vh - 230px)">
          {tabs.map((tab) => (
            <Tabs.Content key={tab.value} px={4} value={tab.value}>
              {tab.content}
            </Tabs.Content>
          ))}
        </Box>
        <Separator />
        <Box pt={2}>
          <Tabs.List bg="bg.muted" rounded="l3" p="1">
            {tabs.map((tab) => (
              <Tabs.Trigger key={tab.value} value={tab.value}>
                {tab.icon}
                {tab.label}
              </Tabs.Trigger>
            ))}
            <Tabs.Indicator rounded="l2" />
          </Tabs.List>
        </Box>
      </Tabs.Root>

      <Box 
        pt={2}
        borderColor="gray.200" 
        _dark={{ borderColor: "gray.700" }}
        bg="bg.muted"
        // flexShrink={0}
      >
        {session ? <UserAccountDropdown user={session.user} onSignOut={() => {}} className="user-account-dropdown" /> : <GoogleSignIn />}
      </Box>
    </Box>
  );
};

export default SidePanel;