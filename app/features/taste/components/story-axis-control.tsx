import { Box, Flex, Text } from "@chakra-ui/react";
import { STORY_AXIS_MAX, STORY_AXIS_MIN, type STORY_AXES } from "../story";

const SCORES = Array.from({ length: STORY_AXIS_MAX - STORY_AXIS_MIN + 1 }, (_, index) => STORY_AXIS_MIN + index);

function describeScore(axis: (typeof STORY_AXES)[number], score: number) {
  if (score === 0) return "No preference";
  return `${Math.abs(score) >= STORY_AXIS_MAX ? "Strongly" : "Leaning"}: ${score < 0 ? axis.low : axis.high}`;
}

interface StoryAxisControlProps {
  axis: (typeof STORY_AXES)[number];
  /** Missing means no preference */
  value: number | undefined;
  onChange: (score: number) => void;
}

/** One story axis as five steps between its two ends; the middle is no preference */
export default function StoryAxisControl({ axis, value = 0, onChange }: StoryAxisControlProps) {
  return (
    <Box role="radiogroup" aria-label={`${axis.low} or ${axis.high}`}>
      <Flex justify="space-between" gap={4} mb={2}>
        <Text fontSize="xs" color={value < 0 ? "orange.300" : "fg.muted"}>{axis.low}</Text>
        <Text fontSize="xs" color={value > 0 ? "orange.300" : "fg.muted"} textAlign="right">{axis.high}</Text>
      </Flex>
      <Flex align="center" justify="space-between" position="relative" px={1}>
        <Box position="absolute" left={2} right={2} height="2px" bg="whiteAlpha.200" />
        {SCORES.map((score) => {
          const selected = score === value;
          const size = score === 0 ? "10px" : Math.abs(score) === STORY_AXIS_MAX ? "18px" : "14px";
          return (
            <Box
              key={score}
              as="button"
              role="radio"
              aria-checked={selected}
              aria-label={describeScore(axis, score)}
              onClick={() => onChange(score)}
              position="relative"
              display="flex"
              alignItems="center"
              justifyContent="center"
              width="32px"
              height="32px"
            >
              <Box
                width={size}
                height={size}
                rounded="full"
                border="2px solid"
                borderColor={selected ? "orange.400" : "whiteAlpha.400"}
                bg={selected ? "orange.400" : "gray.900"}
                transition="all 0.15s"
              />
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
}
