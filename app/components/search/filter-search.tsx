import { useEffect, useState } from "react";
import {  Box, Button, Input } from "@chakra-ui/react";
import { Form, useLocation, useNavigate } from "@remix-run/react";

import GenreCommandEngine from "./CommandEngines/genre";
import KeywordCommandEngine from "./CommandEngines/keyword";
import CastCommandEngine from "./CommandEngines/cast";
import ProviderCommandEngine from "./CommandEngines/provider";
import CountryCommandEngine from "./CommandEngines/country";
import LanguageCommandEngine from "./CommandEngines/language";

import RatingAvgSlider from "./sliders/rating-avg";
import RatingCountSlider from "./sliders/rating-count";
import ReleaseYearSlider from "./sliders/release-year";

import SortMenu from "./filters/sort-menu";

import { GenreInterface } from "~/interfaces/tmdb/genre";
import { FullProviderInterface } from "~/interfaces/tmdb/provider";
import { CountriesInterface, LanguagesInterface } from "~/interfaces/tmdb/configuration";

import { PresetCards } from "./preset-cards";
import RuntimeSlider from "./sliders/runtime";
import { PersonSummaryForInterface } from "~/interfaces/tmdb/people/summary";
import { encodeValues } from "~/utils/helpers";

interface FilterOptionsProps {
    genres: GenreInterface[], 
    providers: FullProviderInterface[], 
    people: PersonSummaryForInterface[], 
    regions: CountriesInterface[], 
    languages: LanguagesInterface[]
    defaults?: RequestFilterProps[]
    sort_by?: string
}

export interface RequestFilterProps {
    key: string,
    type: string,
    name?: string[],
    value: number | string
    disabled?: boolean
  }

const FilterSearch = ({genres, providers, people, regions, languages, defaults, sort_by} : FilterOptionsProps) => {
    console.log('FilterSearch defaults', defaults);
    const location = useLocation()
    const navigate = useNavigate();
    const [isHydrated, setIsHydrated] = useState<boolean>(false);
    const [filters, setFilters] = useState<RequestFilterProps[]>(defaults || []);
  
    const [sort, setSort] = useState(sort_by || "popularity.desc");
  
  
    function getDefault(key: string) {
      const defaultFilter = defaults?.find((i) => i.key === key);
      if (defaultFilter) {
        return defaultFilter;
      }
      return null;
  
    }
  
    const updateFilters = (
      payload: RequestFilterProps
    ) => {
      setFilters(prev => {
        const hasItems = payload.name?.length;
        if (!hasItems) {
          // Remove the entry by filtering it out
          return prev.filter((item) => item.key !== payload.key);
        }
    
        // Add or replace the entry
        const updated = [...prev];
        const index = updated.findIndex((item) => item.key === payload.key);
    
    
        if (index !== -1) {
          updated[index] = payload; // Replace existing
        } else {
          updated.push(payload); // Add new
        }
    
        return updated;
      });
    };
  
    const updateSliderFilter = (
      type: string,
      values: RequestFilterProps[]// Adjusted type to match the expected structure
    ) => {
  
      setFilters(prev => {
        const updated = [
          // Keep only previous filters whose type is still in the new values
          ...prev.filter(p => !p.type.includes(type)),
          // Add any new filters not already included
          ...values
        ];
    
        return updated;
      });
    };

  
  
    function triggerSearchUpdate() { 
      const newParams = new URLSearchParams(location.search);
  
      const serializedFilters = encodeValues(filters) 
  
      newParams.set("page", '1');
      newParams.set("sort", sort.toString());
      if (serializedFilters) {
        newParams.set('filters', serializedFilters)
      } else {
        newParams.delete("filters"); // ✅ Remove the param if no filters
      }
  
      navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  
    useEffect(() => {
        if (isHydrated && (location.pathname === '/search/results' || location.pathname.includes('/genres/') || location.pathname.includes('/search/lists'))) {
            triggerSearchUpdate()
        } else {
            setIsHydrated(true);
        }
    }, [filters, sort]);
    
  return (
    <Box display="flex" flexDirection="column" gap={4}>
      <GenreCommandEngine genres={genres} onSelect={(i) => updateFilters(i) } defaults={getDefault('with_genres')?.name} disabled={getDefault('with_genres')?.disabled || false}/>
      <KeywordCommandEngine onSelect={(i) => updateFilters(i) } defaults={getDefault('with_keywords')?.name} />
      <CastCommandEngine people={people} onSelect={(i) => updateFilters(i) } defaults={getDefault('with_cast')?.name}/>

      <Box mb={8}>
          <RatingAvgSlider onValueChange={(e) => updateSliderFilter('ratingAvg', e)} defaults={defaults?.filter((i) => i.type.includes('ratingAvg'))}/>
      </Box>
      <Box mb={8}>
          <RatingCountSlider onValueChange={(e) => updateSliderFilter('ratingCount', e)} defaults={defaults?.filter((i) => i.type.includes('ratingCount'))}/>
      </Box>
      <Box mb={8}>
          <ReleaseYearSlider onValueChange={(e) => updateSliderFilter('releaseYear', e)} defaults={defaults?.filter((i) => i.type.includes('releaseYear'))}/>
      </Box>
      <Box mb={8}>
          <RuntimeSlider onValueChange={(e) => updateSliderFilter('runtime', e)} defaults={defaults?.filter((i) => i.type.includes('runtime'))}/>
      </Box>
      <ProviderCommandEngine providers={providers} onSelect={(i) => updateFilters(i) } defaults={getDefault( 'with_watch_providers')?.name}/>
      <CountryCommandEngine countries={regions} onSelect={(i) => updateFilters(i) } defaults={getDefault('with_origin_country')?.name}/>
      <LanguageCommandEngine languages={languages} onSelect={(i) => updateFilters(i) } defaults={getDefault('with_original_language')?.name}/>
      <SortMenu value={sort} label='Sort by' onChange={(val) => setSort(val[0])}/>
      <PresetCards />
      <Box mt={8}>
          <Form
          method="get"
          action="/search/lists"
          >
              <Input type="hidden" name="sort" value={sort} />
              <Input type="hidden" name="filters" value={encodeValues(filters)} />
              <Button type="submit" width="100%">Search</Button>
          </Form>
      </Box>
    </Box>
  );
};

export default FilterSearch;
