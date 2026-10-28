import { Box, Button, Flex, Image, Text } from "@chakra-ui/react";
import { BsFilm } from "react-icons/bs";
import type { ComparisonPick } from "../../story";
import type { ComparisonAnswer, ComparisonFilmView, ComparisonPairView } from "../../types";

interface PairPickerProps {
  pairs: ComparisonPairView[];
  answers: ComparisonAnswer[];
  /** Which pair is showing; pairs.length means all have been seen */
  index: number;
  onAnswer: (pairId: string, pick: ComparisonPick | null) => void;
  onBack: () => void;
}

function FilmChoice({ film, selected, onPick }: { film: ComparisonFilmView; selected: boolean; onPick: () => void }) {
  return (
    <Box
      as="button"
      onClick={onPick}
      aria-pressed={selected}
      aria-label={`${film.title} (${film.year})`}
      textAlign="left"
      flex="1"
      minW={0}
      rounded="lg"
      p={2}
      border="2px solid"
      borderColor={selected ? "orange.400" : "transparent"}
      bg={selected ? "orange.900/30" : "whiteAlpha.50"}
      _hover={{ borderColor: selected ? "orange.400" : "whiteAlpha.400" }}
      transition="border-color 0.15s"
    >
      <Box aspectRatio={2 / 3} rounded="md" overflow="hidden" bg="gray.700" mb={2}>
        {film.posterPath ? (
          <Image src={`https://image.tmdb.org/t/p/w342${film.posterPath}`} alt="" width="100%" height="100%" objectFit="cover" />
        ) : (
          <Flex height="100%" align="center" justify="center"><BsFilm size={32} /></Flex>
        )}
      </Box>
      <Text fontWeight="semibold" fontSize="sm" lineClamp={1}>{film.title}</Text>
      <Text fontSize="xs" color="fg.muted" mb={1}>{film.year}</Text>
      <Text fontSize="xs" color="whiteAlpha.700" lineClamp={3}>{film.overview}</Text>
    </Box>
  );
}

/** One pair at a time: tap the film that sounds more like you */
export default function PairPicker({ pairs, answers, index, onAnswer, onBack }: PairPickerProps) {
  if (index >= pairs.length) {
    const picked = answers.filter((answer) => pairs.some((pair) => pair.id === answer.pair)).length;
    return (
      <Box p={6} rounded="lg" border="1px dashed" borderColor="whiteAlpha.300" textAlign="center">
        <Text fontWeight="semibold" mb={1}>That&rsquo;s all {pairs.length}</Text>
        <Text fontSize="sm" color="fg.muted" mb={4}>
          You answered {picked} of {pairs.length}. Continue, or go back to change an answer.
        </Text>
        <Button size="sm" variant="outline" onClick={onBack}>Back to the last pair</Button>
      </Box>
    );
  }

  const pair = pairs[index];
  const pick = answers.find((answer) => answer.pair === pair.id)?.pick ?? null;

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={3}>
        <Text fontSize="xs" color="fg.muted">Pair {index + 1} of {pairs.length}</Text>
        {index > 0 && <Button size="xs" variant="ghost" onClick={onBack}>Previous pair</Button>}
      </Flex>

      <Flex gap={3} align="stretch">
        <FilmChoice film={pair.low} selected={pick === "low"} onPick={() => onAnswer(pair.id, "low")} />
        <FilmChoice film={pair.high} selected={pick === "high"} onPick={() => onAnswer(pair.id, "high")} />
      </Flex>

      <Flex gap={2} mt={3} justify="center" wrap="wrap">
        <Button size="xs" variant={pick === "both" ? "solid" : "outline"} colorPalette={pick === "both" ? "orange" : "gray"} onClick={() => onAnswer(pair.id, "both")}>
          Both
        </Button>
        <Button size="xs" variant={pick === "neither" ? "solid" : "outline"} colorPalette={pick === "neither" ? "orange" : "gray"} onClick={() => onAnswer(pair.id, "neither")}>
          Neither
        </Button>
        <Button size="xs" variant="ghost" onClick={() => onAnswer(pair.id, null)}>
          Skip
        </Button>
      </Flex>
    </Box>
  );
}
