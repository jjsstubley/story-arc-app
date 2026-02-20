import { Badge, Box, Wrap } from "@chakra-ui/react";
import { RequestFilterProps } from "./filter-search";
import { HiX } from "react-icons/hi";

interface ActiveFiltersDisplayProps {
  filters?: RequestFilterProps[];
}

const ActiveFiltersDisplay = ({ filters }: ActiveFiltersDisplayProps) => {
  if (!filters || filters.length === 0) return null;

  // Group filters by type for sliders
  const sliderFilters: { [key: string]: { min?: RequestFilterProps; max?: RequestFilterProps } } = {};
  // Group tag filters by key (filter type) to combine same types
  const tagFiltersByKey: { [key: string]: RequestFilterProps } = {};

  filters.forEach((filter) => {
    if (filter.type && ['ratingAvg', 'releaseYear', 'ratingCount', 'runtime'].includes(filter.type)) {
      if (!sliderFilters[filter.type]) {
        sliderFilters[filter.type] = {};
      }
      if (filter.key.includes('.gte')) {
        sliderFilters[filter.type].min = filter;
      } else if (filter.key.includes('.lte')) {
        sliderFilters[filter.type].max = filter;
      }
    } else if (filter.name && filter.name.length > 0) {
      // Group filters by key - if same key exists, merge the names
      if (tagFiltersByKey[filter.key]) {
        // Merge names, avoiding duplicates
        const existingNames = tagFiltersByKey[filter.key].name || [];
        const newNames = filter.name || [];
        const mergedNames = [...new Set([...existingNames, ...newNames])];
        tagFiltersByKey[filter.key] = {
          ...tagFiltersByKey[filter.key],
          name: mergedNames
        };
      } else {
        tagFiltersByKey[filter.key] = filter;
      }
    }
  });

  const formatSliderRange = (type: string, min?: RequestFilterProps, max?: RequestFilterProps): string => {
    switch (type) {
      case 'ratingAvg':
        const minRating = min ? (typeof min.value === 'number' ? min.value : parseFloat(min.value as string)).toFixed(1) : '0.0';
        const maxRating = max ? (typeof max.value === 'number' ? max.value : parseFloat(max.value as string)).toFixed(1) : '10.0';
        return `Rating: ${minRating} - ${maxRating}`;
      
      case 'releaseYear':
        const minYear = min ? new Date(min.value as string).getFullYear() : null;
        const maxYear = max ? new Date(max.value as string).getFullYear() : null;
        if (minYear && maxYear) {
          return `Year: ${minYear} - ${maxYear}`;
        } else if (minYear) {
          return `Year: ${minYear}+`;
        } else if (maxYear) {
          return `Year: up to ${maxYear}`;
        }
        return '';
      
      case 'ratingCount':
        const minCount = min ? (typeof min.value === 'number' ? min.value : parseFloat(min.value as string)) : 0;
        const maxCount = max ? (typeof max.value === 'number' ? max.value : parseFloat(max.value as string)) : null;
        if (maxCount) {
          return `Votes: ${minCount.toLocaleString()} - ${maxCount.toLocaleString()}`;
        }
        return `Votes: ${minCount.toLocaleString()}+`;
      
      case 'runtime':
        const minRuntime = min ? (typeof min.value === 'number' ? min.value : parseFloat(min.value as string)) : null;
        const maxRuntime = max ? (typeof max.value === 'number' ? max.value : parseFloat(max.value as string)) : null;
        if (minRuntime && maxRuntime) {
          return `Runtime: ${minRuntime} - ${maxRuntime} mins`;
        } else if (minRuntime) {
          return `Runtime: ${minRuntime}+ mins`;
        } else if (maxRuntime) {
          return `Runtime: up to ${maxRuntime} mins`;
        }
        return '';
      
      default:
        return '';
    }
  };

  const getFilterLabel = (key: string): string => {
    const labels: { [key: string]: string } = {
      'with_genres': 'Genres',
      'without_genres': 'Genres',
      'with_keywords': 'Keywords',
      'without_keywords': 'Keywords',
      'with_cast': 'Cast',
      'with_companies': 'Companies',
      'without_companies': 'Companies',
      'with_watch_providers': 'Providers',
      'with_origin_country': 'Country',
      'with_original_language': 'Language',
    };
    return labels[key] || key;
  };

  const getFilterColor = (key: string): string => {
    const colorMap: { [key: string]: string } = {
      'with_genres': 'orange',
      'without_genres': 'red',
      'with_keywords': 'red',
      'without_keywords': 'red',
      'with_cast': 'blue',
      'with_companies': 'purple',
      'without_companies': 'red',
      'with_watch_providers': 'green',
      'with_origin_country': 'gray',
      'without_origin_country': 'red',
      'with_original_language': 'gray',
      'without_original_language': 'red',
    };
    return colorMap[key] || 'blue';
  };

  const isExcludeFilter = (key: string): boolean => {
    return key.startsWith('without_');
  };

  return (
    <Box mb={4}>
      <Wrap gap={2}>
        {/* Display tag-based filters - grouped by filter type */}
        {Object.entries(tagFiltersByKey).map(([key, filter]) => {
          const isExclude = isExcludeFilter(key);
          const colorPalette = getFilterColor(key);
          const label = getFilterLabel(key);
          const names = filter.name || [];
          
          return (
            <Badge 
              key={key} 
              size="md" 
              colorPalette={colorPalette}
              display="flex"
              alignItems="center"
              gap={1}
            >
              {isExclude && (
                <Box as="span" display="inline-flex" alignItems="center">
                  <HiX size={14} />
                </Box>
              )}
              <Box as="span">
                {label}: {names.join(', ')}
              </Box>
            </Badge>
          );
        })}
        
        {/* Display slider ranges */}
        {Object.entries(sliderFilters).map(([type, range]) => {
          const rangeText = formatSliderRange(type, range.min, range.max);
          if (!rangeText) return null;
          return (
            <Badge 
              key={type} 
              size="md" 
              colorPalette="purple"
            >
              {rangeText}
            </Badge>
          );
        })}
      </Wrap>
    </Box>
  );
};

export default ActiveFiltersDisplay;

