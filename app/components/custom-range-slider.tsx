// components/CustomDialog.tsx
import {
  Slider,
} from '@chakra-ui/react';

import type { SliderRootProps as ChakraSliderRootProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface MarksInterface {
  value: number,
  label: ReactNode
}

type CustomDialogProps = {
  value: number[];
  label: string;
  marks?: MarksInterface[]
  indicatorValue?: (rawValue: number, index: number) => string | number;
} & Partial<ChakraSliderRootProps>;

export function CustomSlider({ value, label, marks, indicatorValue, ...dialogProps }: CustomDialogProps) {
  return (
    <Slider.Root value={value} {...dialogProps}>
      <Slider.Label mb={4}>{ label }</Slider.Label>
      <Slider.Control>
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        {
          [0,1].map((index) => (
            <Slider.Thumb index={index} key={index}>
              <Slider.DraggingIndicator
                layerStyle="fill.solid"
                top="6"
                rounded="sm"
                px="1.5"
              >
                {indicatorValue ? indicatorValue(value[index], index) : value[index]}
              </Slider.DraggingIndicator>
            </Slider.Thumb>            
          ))
        }
        {
          marks && (<Slider.Marks marks={marks} />)
        }
      </Slider.Control>
    </Slider.Root>
  );
}