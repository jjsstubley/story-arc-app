import { useState } from "react";
import { CustomSlider } from "~/components/custom-range-slider";

interface RequestFilterProps {
    key: string,
    type: string,
    name?: string[],
    value: number | string
}

const RuntimeSlider = ({onValueChange, defaults} : { onValueChange: (e: RequestFilterProps[]) => void, defaults?: RequestFilterProps[]}) => {
    const RUNTIME_CONFIG = {
        minSlider: 0,
        maxSlider: 8,
        step: 1,
        startMinutes: 60,
        minutesStep: 15,
    };
    const [values, setValues] = useState(returnSliderDefaults());
    
    function sliderValueToMinutes(sliderValue: number) {
        return RUNTIME_CONFIG.startMinutes + (sliderValue * RUNTIME_CONFIG.minutesStep);
    }
    
    function minutesToSliderValue(minutes: number) {
        return Math.round((minutes - RUNTIME_CONFIG.startMinutes) / RUNTIME_CONFIG.minutesStep);
    }

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
    
        const gteRaw = getDefault(`with_runtime.gte`)?.value;
        const lteRaw = getDefault(`with_runtime.lte`)?.value;
    
        if (gteRaw) {
          lowerVal = minutesToSliderValue(parseFloat(gteRaw as string)); 
        }
        if (lteRaw) {
          upperVal = minutesToSliderValue(parseFloat(lteRaw as string));
        }

        return [lowerVal, upperVal]
    }

    // function sliderValueToMinutes(sliderValue: number) {
    //     // sliderValue 0–100 maps to 0–240
    //     return Math.round((sliderValue / 100) * 180);
    // }

    // function minutesToSliderValue(minutes: number) {
    //     return Math.round((minutes / 180) * 100);
    //   }

    function updateSliderFilter(value: number[]) {
        const newConfig = []
        if (value[0] > RUNTIME_CONFIG.minSlider) {
            newConfig.push({
                type: 'runtime',
                key: 'with_runtime.gte',
                value: sliderValueToMinutes(value[0]),
            });
        }
        if (value[1] < RUNTIME_CONFIG.maxSlider) {
            newConfig.push({
                type: 'runtime',
                key: 'with_runtime.lte',
                value: sliderValueToMinutes(value[1]), 
            });
        }
        onValueChange(newConfig);
        setValues(value);
    }
    
    return (
        <CustomSlider 
            min={RUNTIME_CONFIG.minSlider}
            max={RUNTIME_CONFIG.maxSlider}
            value={values} 
            label="Runtime" 
            marks={[
                { value: 0, label: "Short" },
                { value: 4, label: "Avg" },
                { value: 8, label: "Long" },
            ]}
            step={RUNTIME_CONFIG.step}
            indicatorValue={(v) => (sliderValueToMinutes(v) + " mins")}
            onValueChange={(e: { value: number[]; }) => updateSliderFilter(e.value)} 
        />
    );
};

export default RuntimeSlider;