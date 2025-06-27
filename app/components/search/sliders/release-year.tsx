import { useState } from "react";
import { CustomSlider } from "~/components/custom-range-slider";

interface RequestFilterProps {
    key: string,
    type: string,
    name?: string[],
    value: number | string
}

const ReleaseYearSlider = ({onValueChange, defaults} : { onValueChange: (e: RequestFilterProps[]) => void, defaults?: RequestFilterProps[]}) => {
    const [values, setValues] = useState(returnSliderDefaults());

    function getDefault(key: string) {
        const defaultFilter = defaults?.find((i) => i.key === key);
        if (defaultFilter) {
          return defaultFilter;
        }
        return null;
    
    }

    function convertDateStringToSliderValue(dateStr: string) {
        const year = new Date(dateStr).getFullYear();
        const currentDecade = Math.floor(new Date().getFullYear() / 10) * 10;
        const yearsFromPast = currentDecade - year;
        const value = 100 - yearsFromPast;
      
        // Clamp to 0–100
        return Math.max(0, Math.min(100, value));
      }

    function returnSliderDefaults() {
        let upperVal = 100;
        let lowerVal = 0;
        const gteRaw = getDefault(`primary_release_date.gte`)?.value;
        const lteRaw = getDefault(`primary_release_date.lte`)?.value;
    
        if (gteRaw) {
          lowerVal = convertDateStringToSliderValue(gteRaw as string); 
        }
        if (lteRaw) {
          upperVal = convertDateStringToSliderValue(lteRaw as string);
        }

        return [lowerVal, upperVal]
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

    function getDecadeFromValue(v: number) {
        const date = new Date();
        const currentDecade = Math.floor(date.getFullYear() / 10) * 10;
        const decade = currentDecade - (100 - v);
        return decade
    }
    
    function createDateStringFromValue(v:number, condition='lte') {
        const decade = getDecadeFromValue(v)
        let dateString;
        if (decade === 2020) {
          dateString = condition === 'lte' ? new Date().toISOString().split('T')[0] : '2020-01-01'
          return dateString
        }
    
        dateString = condition === 'lte' ? `${decade}-12-31` : `${decade}-01-01`
        return dateString
    }
    
    function updateSliderFilter(value: number[]) {
        const newConfig = []
        if (value[0] > 0) {
            newConfig.push({
                type: 'releaseYear',
                key: 'primary_release_date.gte',
                value: createDateStringFromValue(value[0], 'gte'), // Convert to decimal`
            });
        }
        if (value[1] < 100) {
            newConfig.push({
                type: 'releaseYear',
                key: 'primary_release_date.lte',
                value: createDateStringFromValue(value[1], 'lte'), // Convert to decimal`
            });
        }

        console.log('')
        onValueChange(newConfig);
        setValues(value);
    }

    return (
        <CustomSlider 
            value={values} 
            label="Release year" 
            marks={getDecadeMarkers()}
            indicatorValue={(v) => {
              return `${getDecadeFromValue(v)}s`
            }}
            step={10}
            onValueChange={(e: { value: number[]; }) => updateSliderFilter(e.value)} 
        />
    );
};

export default ReleaseYearSlider;