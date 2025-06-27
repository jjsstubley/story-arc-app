import { useState } from "react";
import { CustomSlider } from "~/components/custom-range-slider";

interface RequestFilterProps {
    key: string,
    type: string,
    name?: string[],
    value: number | string
}

const RatingAvgSlider = ({onValueChange, defaults} : { onValueChange: (e: RequestFilterProps[]) => void, defaults?: RequestFilterProps[]}) => {
    
    console.log('RatingAvgSlider defaults', defaults)
    const [values, setValues] = useState(returnSliderDefaults());

    function getDefault(key: string) {
        const defaultFilter = defaults?.find((i) => i.key === key);
        console.log('getDefault', key, defaultFilter)
        if (defaultFilter) {
          return defaultFilter;
        }
        return null;
    
    }

    function returnSliderDefaults() {
        let upperVal = 100;
        let lowerVal = 0;
    
        const gteRaw = getDefault(`vote_average.gte`)?.value;
        const lteRaw = getDefault(`vote_average.lte`)?.value;
    
        if (gteRaw) {
          lowerVal = parseFloat(gteRaw as string) * 10; 
        }
        if (lteRaw) {
          upperVal = parseFloat(lteRaw as string) * 10;
        }

        console.log('upperVal', upperVal, 'lowerVal', lowerVal)

        return [lowerVal, upperVal]
    }

    function updateSliderFilter(value: number[]) {
        const newConfig = []
        if (value[0] > 0) {
            newConfig.push({
                type: 'ratingAvg',
                key: 'vote_average.gte',
                value: value[0] / 10, // Convert to decimal`
            });
        }
        if (value[1] < 100) {
            newConfig.push({
                type: 'ratingAvg',
                key: 'vote_average.lte',
                value: value[1] / 10, // Convert to decimal`
            });
        }
        console.log('updateSliderFilter newConfig', newConfig)
        onValueChange(newConfig);
        setValues(value);
    }
    return (
        <CustomSlider 
            value={values} 
            label="Rating Avg." 
            marks={[
                { value: 0, label: "0" },
                { value: 50, label: "5" },
                { value: 100, label: "10" },
            ]}
            step={5} 
            indicatorValue={(v) => (v / 10).toFixed(1)}
            onValueChange={(e: { value: number[]; }) => updateSliderFilter(e.value)} 
        />
    );
};

export default RatingAvgSlider;