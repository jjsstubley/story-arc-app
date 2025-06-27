// app/components/EmblaCarousel.tsx
import React, { useEffect, PropsWithChildren } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType } from "embla-carousel";
import { Box } from "@chakra-ui/react";
// import { NextButton, PrevButton, usePrevNextButtons } from "./emblaCarouselArrowButtons";

type EmblaCarouselProps = PropsWithChildren<{
  options?: EmblaOptionsType;
  flex?: string
}>;

export const EmblaCarousel = ({
  children,
  options = { loop: false, dragFree: true },
  flex='0 0 200px'
}: EmblaCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  useEffect(() => {
    if (!emblaApi) return;

    // You can add plugins, autoplay or API calls here
    // emblaApi.on('select', () => { ... });
  }, [emblaApi]);

  // const {
  //   prevBtnDisabled,
  //   nextBtnDisabled,
  //   onPrevButtonClick,
  //   onNextButtonClick
  // } = usePrevNextButtons(emblaApi)

  return (
    <Box className={`embla`}>
      <Box className={`embla__viewport`} ref={emblaRef}  width="100%">
        <Box className="embla__container" display="flex" width="100%" gap={2} >
          {React.Children.map(children, (child) => (
            <Box className={`embla__slide`} px={2} minW="0" flex={flex}>{child}</Box>
          ))}
        </Box>
      </Box>
      {/* <div className="embla__controls">
        <div className="embla__buttons">
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        </div>

        <div className="embla__dots">
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={'embla__dot'.concat(
                index === selectedIndex ? ' embla__dot--selected' : ''
              )}
            />
          ))}
        </div>
      </div> */}
    </Box>
  );
};