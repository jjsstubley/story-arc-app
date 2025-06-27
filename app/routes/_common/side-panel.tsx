import { Avatar, Box, Heading, Separator, Tabs, Text } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { CountriesInterface, LanguagesInterface } from "~/interfaces/tmdb/configuration";
import { GenreInterface } from "~/interfaces/tmdb/genre";
import {  PersonKnownForInterface } from "~/interfaces/tmdb/people";
import { FullProviderInterface } from "~/interfaces/tmdb/provider";
import { CiSearch } from "react-icons/ci";
import { LuSquareCheck, LuUser, LuChevronsRight } from "react-icons/lu";
import FilterSearch from "~/components/search/filter-search";
import { FaRegCircle } from "react-icons/fa";
import { slugify } from "~/utils/helpers";
// import SearchFeature from "~/components/search/searchFeature";
import SideTempWatchlist from "~/components/watchlist/side-temp-watchlist";
import { DynamicBreadcrumbs } from "~/components/breadcrumbs";

interface RequestFilterProps {
  key: string,
  type: string,
  name?: string[],
  value: number | string
}

interface FilterOptionsProps {
  genres: GenreInterface[], 
  providers: FullProviderInterface[], 
  people: PersonKnownForInterface[], 
  regions: CountriesInterface[], 
  languages: LanguagesInterface[]
  defaults?: RequestFilterProps[]
  sort_by?: string
  collections?: { id: string, name: string }[]
}

const SidePanel = ({genres, providers, people, regions, languages, defaults, sort_by, collections} : FilterOptionsProps) => {
  const genreList = ['Action', 'Animation', 'Horror', 'Comedy', 'Drama', 'Documentary', 'Sci-Fi'];
  return (
    <Box as="nav" w={{ base: "100%", md: "25%" }} minWidth="300px" bgColor="bg.muted" rounded="lg" position="sticky" top={10} height="84vh" overflow="hidden">
      {/* <Text>Sidebar</Text> */}
      <Tabs.Root defaultValue="home" variant="plain" size="sm" fitted>
        <Box p={4}>
          <DynamicBreadcrumbs />
        </Box>
        <Box py={2}>
          <Tabs.List bg="bg.muted" rounded="l3" p="1">
            <Tabs.Trigger value="home">
              <LuUser />
              Home
            </Tabs.Trigger>
            <Tabs.Trigger value="search">
              <CiSearch />
              Search
            </Tabs.Trigger>
            <Tabs.Trigger value="reel">
              <LuSquareCheck />
              My Reel
            </Tabs.Trigger>
            <Tabs.Indicator rounded="l2" />
          </Tabs.List>
        </Box>
        <Separator />
        <Box overflow="auto" height="74vh">
          <Tabs.Content px={4} value="home">
            <Box>
              {/* <Heading as="h3" > Discover </Heading> */}
              <Box display="flex" flexDirection="column" gap={2} mt={2}>
                <Heading as="h3" color="whiteAlpha.600" size="sm"> Collections </Heading>
                <Separator colorPalette="orange" />
                {
                  collections?.map(collection => (
                    <Link to={`/collection/${collection.id}`} key={collection.id}>
                      <Box display="flex" gap={4} alignItems="center" fontSize="xs" rounded="md" p={2} py={1} _hover={
                        { bg: 'gray.800', color: "orange.400", cursor: "pointer" }
                      }>
                        <FaRegCircle  /><Heading as="h3" fontSize="xs">{collection.name}</Heading>
                      </Box>
                    </Link>
                  ))
                }
    
                {/* <Link to="/genres"><Box display="flex" gap={2} alignItems="center" color="gray.700"><MdOutlineSubdirectoryArrowRight /><Heading as="h3" fontSize="sm" letterSpacing="0.225em">Genre</Heading></Box></Link>
                <Link to="/cast"><Box display="flex" gap={2} alignItems="center" color="gray.700"><MdOutlineSubdirectoryArrowRight /><Heading as="h3" fontSize="sm" letterSpacing="0.225em">Cast</Heading></Box></Link> */}
              </Box>
              <Box display="flex" flexDirection="column" gap={2} my={8}>
                <Link to="/genres"><Heading as="h3" color="whiteAlpha.600" size="sm"> Genres </Heading></Link>
                <Separator colorPalette="orange" />
                {
                  genres?.filter((i) => genreList.includes(i.name) ).map(genre => (
                    <Link to={`/genres/${genre.name}`} key={genre.id}>
                      <Box display="flex" gap={4} alignItems="center" fontSize="xs" rounded="md" p={2} py={1} _hover={
                        { bg: 'gray.800', color: "orange.400", cursor: "pointer" }
                      }>
                        <FaRegCircle  /><Heading as="h3" fontSize="xs">{genre.name}</Heading>
                      </Box>
                    </Link>
                  ))
                }

                <Link to="/genres"><Box p={2} display="flex" gap={2} alignItems="center" fontSize="sm" color={"whiteAlpha.600"} cursor="pointer" _hover={{ color: 'white'}}><Text >See more</Text> <LuChevronsRight /></Box></Link>

                {/* <Link to="/genres"><Box display="flex" gap={2} alignItems="center" color="gray.700"><MdOutlineSubdirectoryArrowRight /><Heading as="h3" fontSize="sm" letterSpacing="0.225em">Genre</Heading></Box></Link>
                <Link to="/cast"><Box display="flex" gap={2} alignItems="center" color="gray.700"><MdOutlineSubdirectoryArrowRight /><Heading as="h3" fontSize="sm" letterSpacing="0.225em">Cast</Heading></Box></Link> */}
              </Box>
              <Box display="flex" flexDirection="column" gap={2} my={8}>
                <Link to="/genres"><Heading as="h3" color="whiteAlpha.600" size="sm"> Stars </Heading></Link>
                <Separator colorPalette="orange" />
                {
                  people?.slice(0, 10).map(person => (
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
                  ))
                }

                <Link to="/genres"><Box p={2} display="flex" gap={2} alignItems="center" fontSize="sm" color={"whiteAlpha.600"} cursor="pointer" _hover={{ color: 'white'}}><Text >See more</Text> <LuChevronsRight /></Box></Link>

                {/* <Link to="/genres"><Box display="flex" gap={2} alignItems="center" color="gray.700"><MdOutlineSubdirectoryArrowRight /><Heading as="h3" fontSize="sm" letterSpacing="0.225em">Genre</Heading></Box></Link>
                <Link to="/cast"><Box display="flex" gap={2} alignItems="center" color="gray.700"><MdOutlineSubdirectoryArrowRight /><Heading as="h3" fontSize="sm" letterSpacing="0.225em">Cast</Heading></Box></Link> */}
              </Box>
            </Box>
          </Tabs.Content>
          <Tabs.Content px={4} value="search">
            <FilterSearch genres={genres} providers={providers} people={people} regions={regions} languages={languages} defaults={defaults} sort_by={sort_by} />
          </Tabs.Content>
          <Tabs.Content value="reel">
            <Box>
              {/* <SearchFeature genres={genres} /> */}
              <SideTempWatchlist />
            </Box>
          </Tabs.Content>
        </Box>
      </Tabs.Root>
      <Box display="flex" flexDirection="column" gap={12}>
        {/* <Box display="flex" flexDirection="column" gap={4}>
          <Box mb={4}>
            <Heading as="h3" > Search  </Heading>
          </Box>
          <GenreCommandEngine genres={genres} onSelect={(i) => updateFilters(i) } defaults={getDefault('with_genres')?.name}/>
          <KeywordCommandEngine onSelect={(i) => updateFilters(i) } defaults={getDefault('with_keywords')?.name}/>
          <CastCommandEngine people={people} onSelect={(i) => updateFilters(i) } defaults={getDefault('with_cast')?.name}/>
          <Box>
            <Box mb={8}>
              <RatingAvgSlider onValueChange={(e) => updateSliderFilter('ratingAvg', e)} defaults={defaults?.filter((i) => i.type.includes('ratingAvg'))}/>
            </Box>
            <Box mb={8}>
              <RatingCountSlider onValueChange={(e) => updateSliderFilter('ratingCount', e)} defaults={defaults?.filter((i) => i.type.includes('ratingCount'))}/>
            </Box>
            <Box mb={8}>
              <ReleaseYearSlider onValueChange={(e) => updateSliderFilter('releaseYear', e)} defaults={defaults?.filter((i) => i.type.includes('releaseYear'))}/>
            </Box>
            <ProviderCommandEngine providers={providers} onSelect={(i) => updateFilters(i) } defaults={getDefault( 'with_watch_providers')?.name}/>
            <CountryCommandEngine countries={regions} onSelect={(i) => updateFilters(i) } defaults={getDefault('with_origin_country')?.name}/>
            <LanguageCommandEngine languages={languages} onSelect={(i) => updateFilters(i) } defaults={getDefault('with_original_language')?.name}/>
            <SortMenu value={sort} label='Sort by' onChange={(val) => setSort(val[0])}/>
            <Box mt={8}>
              <Form
                method="get"
                action="/search/results"
              >
                <Input type="hidden" name="sort" value={sort} />
                <Input type="hidden" name="filters" value={encodeValues()} />
                <Button type="submit" width="100%">Search</Button>
              </Form>
            </Box>
          </Box>
        </Box> */}
        {/* <Box>
          <Heading as="h3" > Discover </Heading>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <Link to="/genres"><Box display="flex" gap={2} alignItems="center" color="gray.700"><MdOutlineSubdirectoryArrowRight /><Heading as="h3" fontSize="sm" letterSpacing="0.225em">Genre</Heading></Box></Link>
            <Link to="/cast"><Box display="flex" gap={2} alignItems="center" color="gray.700"><MdOutlineSubdirectoryArrowRight /><Heading as="h3" fontSize="sm" letterSpacing="0.225em">Cast</Heading></Box></Link>
          </Box>
        </Box> */}
      </Box>
    </Box>
  );
};

export default SidePanel;