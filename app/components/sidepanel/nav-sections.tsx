import { ReactNode } from "react";
import { Session } from "@supabase/supabase-js";
import { CiSearch } from "react-icons/ci";
import { IoLibrary } from "react-icons/io5";
import { LiaCompass } from "react-icons/lia";
import { CountriesInterface, LanguagesInterface } from "~/interfaces/tmdb/configuration";
import { GenreInterface } from "~/interfaces/tmdb/genre";
import { FullProviderInterface } from "~/interfaces/tmdb/provider";
import { PersonSummaryForInterface } from "~/interfaces/tmdb/people/summary";
import { WatchlistInterface } from "~/interfaces/watchlist";
import DiscoverNavSection from "./sections/discover-nav-section";
import LibraryNavSection from "./sections/library-nav-section";
import SearchNavSection from "./sections/search-nav-section";

interface RequestFilterProps {
  key: string,
  type: string,
  name?: string[],
  value: number | string
}

export interface FilterOptionsProps {
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

export interface NavSection {
  label: string;
  /** Short label for the mobile bottom bar */
  tabLabel: string;
  value: string;
  description: string;
  icon: ReactNode;
  color: { default: string; hover: string };
  content: ReactNode;
}

/** The app's main navigation, shown as the desktop side panel and the mobile bottom bar */
export function getNavSections(filters: FilterOptionsProps, session: Session | null): NavSection[] {
  return [
    {
      label: "Discover",
      tabLabel: "Discover",
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
      tabLabel: "Library",
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
      tabLabel: "Browse",
      value: "search",
      description: "Search by title, filters, or description",
      icon: <CiSearch color="orange" size={20} />, 
      color: {
        default: "green.900/30",
        hover: "green.900/80",
      },
      content: <SearchNavSection genres={filters.genres} providers={filters.providers} people={filters.people} regions={filters.regions} languages={filters.languages} defaults={filters.defaults} sort_by={filters.sort_by} />
    },
  ];
}
