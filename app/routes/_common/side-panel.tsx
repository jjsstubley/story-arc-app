import { Box, Button, Combobox, Heading, Input } from "@chakra-ui/react";
import { Form, Link } from "@remix-run/react";
import { SetStateAction, useState } from "react";
import { MdOutlineSubdirectoryArrowRight } from "react-icons/md";
import { CustomSlider } from "~/components/custom-range-slider";
import CastCommandEngine from "~/components/search/CommandEngines/cast";
import CountryCommandEngine from "~/components/search/CommandEngines/country";
import GenreCommandEngine from "~/components/search/CommandEngines/genre";
import KeywordCommandEngine from "~/components/search/CommandEngines/keyword";
import LanguageCommandEngine from "~/components/search/CommandEngines/language";
import ProviderCommandEngine from "~/components/search/CommandEngines/provider";
import SortMenu from "~/components/search/filters/sort-menu";
import { CountriesInterface, LanguagesInterface } from "~/interfaces/configuration";
import { GenreInterface } from "~/interfaces/genre";
import {  PersonKnownForInterface } from "~/interfaces/people";
import { FullProviderInterface } from "~/interfaces/provider";

interface DefaultsProps {
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
  defaults?: DefaultsProps[]
}



const SidePanel = ({genres, providers, people, regions, languages, defaults} : FilterOptionsProps) => {
  console.log('SidePanel defaults', defaults)
  const transformMap: Record<
  string,
  {
    gte?: (value: string) => number;
    lte?: (value: string) => number;
  }
  > = {
  vote_average: {
    gte: (val) => parseFloat(val) * 10,
    lte: (val) => parseFloat(val) * 10,
  },
  vote_count: {
    gte: (val) => parseFloat(val) / 10,
    lte: (val) => parseFloat(val) / 10,
  },
  primary_release_date: {
    gte: (val) => new Date(val).getTime(), // or parseInt(val.slice(0, 4)) for just the year
    lte: (val) => new Date(val).getTime(),
  },
  // Add more as needed
  };
  const [ratingAvg, setRatingAvg] = useState<number[]>(returnSliderDefaults('vote_average'))
  const [ratingCount, setRatingCount] = useState<number[]>(returnSliderDefaults('vote_count'))
  const [releaseYear, setReleaseYear] = useState<number[]>(returnSliderDefaults('primary_release_date'))
  const [keywords, setKeywords] = useState<Combobox.ValueChangeDetails | null>(null)
  const [returnedGenres, setGenres] = useState<Combobox.ValueChangeDetails | null>(null)
  const [cast, setCast] = useState<Combobox.ValueChangeDetails | null>(null)
  const [sort, setSort] = useState("popularity.desc");

  const [provider, setProvider] = useState<Combobox.ValueChangeDetails | null>(null)
  const [countries, setCountries] = useState<Combobox.ValueChangeDetails | null>(null)
  const [language, setLanguage] = useState<Combobox.ValueChangeDetails | null>(null)


  function getDefault(type: string) {
    const defaultFilter = defaults?.find((i) => i.type === type);
    if (defaultFilter) {
      return defaultFilter;
    }
    return null;

  }

  function returnSliderDefaults(type: string) {
    let upperVal = 100;
    let lowerVal = 0;

    const transformers = transformMap[type] ?? {};

    const gteRaw = getDefault(`${type}.gte`)?.value;
    const lteRaw = getDefault(`${type}.lte`)?.value;

    if (gteRaw) {
      lowerVal = transformers.gte ? transformers.gte(gteRaw as string) : parseFloat(gteRaw as string);
    }
    if (lteRaw) {
      upperVal = transformers.lte ? transformers.lte(lteRaw as string) : parseFloat(lteRaw as string);
    }
    return [lowerVal, upperVal]
  }


  function generatePayload () {
    return [
      ...(keywords?.value?.length
        ? [{ type: 'with_keywords', name: keywords.value, value: keywords.items.map(i => i.id).join('|') }]
        : []),
      ...(returnedGenres?.value?.length
        ? [{ type: 'with_genres', name: returnedGenres.value, value: returnedGenres.items.map(i => i.id).join('|') }]
        : []),
      ...(cast?.value?.length
        ? [{ type: 'with_cast', name: cast.value, value: cast.items.map(i => i.id).join('|') }]
        : []),
      ...(provider?.value?.length
        ? [{ type: 'with_watch_providers', name: provider.value, value: provider.items.map(i => i.id).join('|') }]
        : []),
      ...(ratingAvg[0]
        ? [{ type: 'vote_average.gte', value: ratingAvg[0] / 10 }]
        : []),
      ...(ratingAvg[1] < 100
        ? [{ type: 'vote_average.lte', value: ratingAvg[1] / 10 }]
        : []),
      ...(ratingCount[0]
        ? [{ type: 'vote_count.gte', value: ratingCount[0] * 10 }]
        : []),
      ...(ratingCount[1] < 100
        ? [{ type: 'vote_count.lte', value: ratingCount[1] * 10 }]
        : []),
      ...(sort
        ? [{ type: 'sort_by', value: sort}]
        : []),
      ...(releaseYear[0]
        ? [{ type: 'primary_release_date.gte', value: createDateStringFromValue(releaseYear[0], 'gte') }]
        : []),
      ...(releaseYear[1] < 100
        ? [{ type: 'primary_release_date.lte', value: createDateStringFromValue(releaseYear[1], 'lte') }]
        : []),
      ...(countries
        ? [{ type: 'with_origin_country', name: countries.value, value: countries.items[0].iso_3166_1 }] // This need to be fixed currently using the MultiCombobox should be signle combo or select
        : []),
      ...(language
        ? [{ type: 'with_original_language', name: language.value, value: language.items[0].iso_639_1 }] // This need to be fixed currently using the MultiCombobox should be signle combo or select
        : []),
    ]
  }

  function mergeFilters(defaults: DefaultsProps[] = [], newFilters: DefaultsProps[]) {
    const mergedMap = new Map<string, DefaultsProps>();
  
    // Add defaults first
    for (const def of defaults) {
      mergedMap.set(def.type, { ...def });
    }
  
    // Merge or add new filters
    for (const filter of newFilters) {
      const existing = mergedMap.get(filter.type);
      if (existing) {

        const mergedNames = [...new Set([...(existing.name || []), ...(filter.name || [])])];
        let mergedValue
        if (filter.type === 'with_genres' || filter.type === 'with_keywords' || filter.type === 'with_cast', filter.type === 'with_watch_providers') { 
          mergedValue = [...new Set([
            ...(existing.value.toString()?.split('|') ?? []),
            ...(filter.value.toString()?.split('|') ?? [])
          ])].join('|');
        } else {
          mergedValue = filter.value; // For other types, you can decide whether to append or overwrite the value
        }

        mergedMap.set(filter.type, {
          ...filter,
          name: mergedNames,
          value: mergedValue // You can decide whether to append/overwrite value depending on your logic
        });
      } else {
        mergedMap.set(filter.type, filter);
      }
    }
  
    return Array.from(mergedMap.values());
  }

  function encodeValues () {
    const newFilters = generatePayload()
    const mergedFilters = mergeFilters(defaults, newFilters);
    console.log('params', mergedFilters)
    const json = JSON.stringify(mergedFilters)
    return btoa(json)  
  }

  function getDecadeFromValue(v: number) {
    const date = new Date();
    const currentDecade = Math.floor(date.getFullYear() / 10) * 10;
    const decade = currentDecade - (100 - v);
    return decade
  }

  function createDateStringFromValue(v:number, condition='lte') {
    const decade = getDecadeFromValue(v)
    let dateString;
    console.log('createDateStringFromValue decade', decade)
    if (decade === 2020) {
      dateString = condition === 'lte' ? new Date().toISOString().split('T')[0] : '2020-01-01'
      return dateString
    }

    dateString = condition === 'lte' ? `${decade}-12-31` : `${decade}-01-01`
    return dateString
  }

  function getDecadeMarkers() {
    const date = new Date(); // current date
    const year = date.getFullYear(); // e.g., 2025
    const currentDecade = Math.floor(year / 10) * 10;
    const halfwayDecade = currentDecade - (10 * 5)
    const firstDecade = currentDecade - (10 * 10)

    return [
      { value: 0, label: `${firstDecade}s` },
      { value: 50, label: `${halfwayDecade}s` },
      { value: 100, label: `${currentDecade}s` },
    ]

  }
  return (
    <Box as="nav" w={{ base: "100%", md: "25%" }} minWidth="300px" minHeight="90vh" p={8} bgColor="bg.muted" rounded="lg">
      {/* <Text>Sidebar</Text> */}
      <Box display="flex" flexDirection="column" gap={12}>
        <Box display="flex" flexDirection="column" gap={4}>
          <Box mb={4}>
            <Heading as="h3" > Search  </Heading>
          </Box>
          <GenreCommandEngine genres={genres} onSelect={(i) => setGenres(i) } defaults={getDefault('with_genres')?.name}/>
          <KeywordCommandEngine onSelect={(i) => setKeywords(i) } defaults={getDefault('with_keywords')?.name}/>
          <CastCommandEngine people={people} onSelect={(i) => setCast(i) } defaults={getDefault('with_cast')?.name}/>
          <Box>

            <CustomSlider 
              value={ratingAvg} 
              label="Rating Avg." 
              marks={[
                { value: 0, label: "0" },
                { value: 50, label: "5" },
                { value: 100, label: "10" },
              ]}
              step={5} 
              indicatorValue={(v) => (v / 10).toFixed(1)}
              onValueChange={(e: { value: SetStateAction<number[]>; }) => setRatingAvg(e.value)} 
              mb={8} 
            />
            <CustomSlider 
              value={ratingCount} 
              label="Rating Count" 
              marks={[
                { value: 0, label: "0" },
                { value: 50, label: "500" },
                { value: 100, label: "1000+" },
              ]}
              indicatorValue={(v) => (v * 10)}
              step={10}
              onValueChange={(e: { value: SetStateAction<number[]>; }) => setRatingCount(e.value)} 
              mb={8} 
            />
            <CustomSlider 
              value={releaseYear} 
              label="Release year" 
              marks={getDecadeMarkers()}
              indicatorValue={(v) => {
                return `${getDecadeFromValue(v)}s`
              }}
              step={10}
              onValueChange={(e: { value: SetStateAction<number[]>; }) => setReleaseYear(e.value)} 
              mb={8} 
            />
            <ProviderCommandEngine providers={providers} onSelect={(i) => setProvider(i) } defaults={getDefault( 'with_watch_providers')?.name}/>
            <CountryCommandEngine countries={regions} onSelect={(i) => setCountries(i) } defaults={getDefault('with_origin_country')?.name}/>
            <LanguageCommandEngine languages={languages} onSelect={(i) => setLanguage(i) } defaults={getDefault('with_original_language')?.name}/>
            <SortMenu value={sort} label='Sort by' onChange={(val) => setSort(val[0])}/>
            <Box mt={8}>
              <Form
                method="get"
                action="/search/results"
              >
                <Input type="hidden" name="filters" value={encodeValues()} />
                <Button type="submit" width="100%">Search</Button>
              </Form>
            </Box>
          </Box>
        </Box>
        <Box>
          <Heading as="h3" > Discover </Heading>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <Link to="/genres"><Box display="flex" gap={2} alignItems="center" color="gray.700"><MdOutlineSubdirectoryArrowRight /><Heading as="h3" fontSize="sm" letterSpacing="0.225em">Genre</Heading></Box></Link>
            <Link to="/cast"><Box display="flex" gap={2} alignItems="center" color="gray.700"><MdOutlineSubdirectoryArrowRight /><Heading as="h3" fontSize="sm" letterSpacing="0.225em">Cast</Heading></Box></Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SidePanel;