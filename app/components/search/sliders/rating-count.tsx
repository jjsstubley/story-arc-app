import { useState } from "react";
import { CustomSlider } from "~/components/custom-range-slider";

interface RequestFilterProps {
    key: string,
    type: string,
    name?: string[],
    value: number | string
}

const RatingCountSlider = ({onValueChange, defaults} : { onValueChange: (e: RequestFilterProps[]) => void, defaults?: RequestFilterProps[]}) => {
    const [values, setValues] = useState(returnSliderDefaults());

    function getDefault(key: string) {
        const defaultFilter = defaults?.find((i) => i.key === key);
        if (defaultFilter) {
          return defaultFilter;
        }
        return null;
    
    }

    function returnSliderDefaults() {
        let upperVal = 100;
        let lowerVal = 0;
    
        const gteRaw = getDefault(`vote_count.gte`)?.value;
        const lteRaw = getDefault(`vote_count.lte`)?.value;
    
        if (gteRaw) {
          lowerVal = parseFloat(gteRaw as string) / 10; 
        }
        if (lteRaw) {
          upperVal = parseFloat(lteRaw as string) / 10;
        }

        return [lowerVal, upperVal]
    }

    function updateSliderFilter(value: number[]) {
        const newConfig = []
        if (value[0] > 0) {
            newConfig.push({
                type: 'ratingCount',
                key: 'vote_count.gte',
                value: value[0] * 10, // Convert to decimal`
            });
        }
        if (value[1] < 100) {
            newConfig.push({
                type: 'ratingCount',
                key: 'vote_count.lte',
                value: value[1] * 10, // Convert to decimal`
            });
        }
        onValueChange(newConfig);
        setValues(value);
    }
    return (
        <CustomSlider 
            value={values} 
            label="Rating Count" 
            marks={[
                { value: 0, label: "0" },
                { value: 50, label: "500" },
                { value: 100, label: "1000+" },
            ]}
            step={10}
            indicatorValue={(v) => (v * 10)}
            onValueChange={(e: { value: number[]; }) => updateSliderFilter(e.value)} 
        />
    );
};

export default RatingCountSlider;