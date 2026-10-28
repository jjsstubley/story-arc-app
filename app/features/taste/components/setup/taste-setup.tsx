import { Box, Button, Flex, Heading, Text, Wrap } from "@chakra-ui/react";
import { useNavigate } from "@remix-run/react";
import { useState, type ReactNode } from "react";
import { MAX_KEYWORDS, MAX_PEOPLE, SUGGESTED_KEYWORDS } from "../../options";
import { useSaveTastePreferences } from "../../queries";
import { ARC_TYPES, axesFromComparisons, type ComparisonPick } from "../../story";
import type { ComparisonAnswer, ComparisonPairView, TasteKeyword, TastePerson, TastePreferences, TastePreferencesUpdate } from "../../types";
import { Chip, GenreChips, RemovableChip, toggleItem } from "../chips";
import PairPicker from "./pair-picker";
import SearchPicker from "../search-picker";

interface TasteSetupProps {
  /** Saved preferences, so a returning user starts from what they've told us */
  initialPreferences: TastePreferences;
  genres: { id: number; name: string }[];
  pairs: ComparisonPairView[];
  /** Where to go when finished or put off */
  next: string;
}

const STEPS = [
  { key: "genres", title: "What do you usually watch?", hint: "Tap once to favour a genre, twice to avoid it." },
  { key: "stories", title: "What kinds of stories pull you in?", hint: "Pick subgenres and story arcs you love. Skip anything you're unsure of." },
  { key: "pairs", title: "Which sounds more like you?", hint: "You don't need to have seen them. Go with your gut." },
  { key: "people", title: "Whose films would you always watch?", hint: "Directors and actors you seek out." },
] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box>
      <Text fontWeight="semibold" fontSize="sm" mb={3}>{title}</Text>
      {children}
    </Box>
  );
}

/** The guided taste setup: four short steps, each saved as you go */
export default function TasteSetup({ initialPreferences, genres, pairs, next }: TasteSetupProps) {
  const navigate = useNavigate();
  const save = useSaveTastePreferences();
  const alreadyDone = Boolean(initialPreferences.onboarded_at);

  const [step, setStep] = useState(0);
  const [pairIndex, setPairIndex] = useState(0);
  const [favourite, setFavourite] = useState(initialPreferences.favourite_genre_ids);
  const [avoided, setAvoided] = useState(initialPreferences.avoided_genre_ids);
  const [keywords, setKeywords] = useState<TasteKeyword[]>(initialPreferences.keywords);
  const [arcTypes, setArcTypes] = useState(initialPreferences.arc_types);
  const [comparisons, setComparisons] = useState<ComparisonAnswer[]>(initialPreferences.comparisons);
  const [people, setPeople] = useState<TastePerson[]>(initialPreferences.people);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const stepUpdate = (): TastePreferencesUpdate => {
    switch (current.key) {
      case "genres":
        return { favourite_genre_ids: favourite, avoided_genre_ids: avoided };
      case "stories":
        return { keywords: keywords.map(({ id }) => ({ id })), arc_types: arcTypes };
      case "pairs":
        return { comparisons, story_axes: axesFromComparisons(comparisons) };
      case "people":
        return { people: people.map(({ id, role }) => ({ id, role })) };
    }
  };

  const goNext = async () => {
    if (!isLast) {
      save.mutate(stepUpdate());
      setStep(step + 1);
      return;
    }
    // Nothing to show optimistically here, so wait; errors are toasted by the mutation
    try {
      await save.mutateAsync({ ...stepUpdate(), onboarding: "completed" });
      navigate(next);
    } catch {
      // Stay on the step so they can try again
    }
  };

  const doLater = () => {
    save.mutate(alreadyDone ? stepUpdate() : { ...stepUpdate(), onboarding: "skipped" });
    navigate(next);
  };

  const answerPair = (pairId: string, pick: ComparisonPick | null) => {
    const others = comparisons.filter((answer) => answer.pair !== pairId);
    setComparisons(pick ? [...others, { pair: pairId, pick }] : others);
    setPairIndex(pairIndex + 1);
  };

  const keywordIds = keywords.map((keyword) => keyword.id);
  const toggleKeyword = (keyword: TasteKeyword) =>
    setKeywords(keywordIds.includes(keyword.id) ? keywords.filter((k) => k.id !== keyword.id) : [...keywords, keyword]);
  const customKeywords = keywords.filter((keyword) => !SUGGESTED_KEYWORDS.some((suggested) => suggested.id === keyword.id));

  return (
    <Box maxW="2xl" mx="auto" px={4} pt={{ base: 6, md: 12 }} pb={10}>
      <Flex justify="space-between" align="center" mb={6} gap={3}>
        <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="0.3em" color="orange.400">
          {alreadyDone ? "Update your taste" : "Set up your taste"}
        </Text>
        <Button size="xs" variant="ghost" onClick={doLater}>{alreadyDone ? "Exit" : "Do it later"}</Button>
      </Flex>

      <Flex gap={1.5} mb={2} aria-hidden>
        {STEPS.map((s, index) => (
          <Box key={s.key} flex="1" height="3px" rounded="full" bg={index <= step ? "orange.400" : "whiteAlpha.200"} />
        ))}
      </Flex>
      <Text fontSize="xs" color="fg.muted" mb={6}>Step {step + 1} of {STEPS.length}</Text>

      <Heading as="h1" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="light" mb={2}>{current.title}</Heading>
      <Text fontSize="sm" color="fg.muted" mb={6}>{current.hint}</Text>

      <Flex direction="column" gap={8} minH="300px">
        {current.key === "genres" && (
          <GenreChips
            genres={genres}
            favourite={favourite}
            avoided={avoided}
            onChange={(change) => {
              setFavourite(change.favourite);
              setAvoided(change.avoided);
            }}
          />
        )}

        {current.key === "stories" && (
          <>
            <Section title="Subgenres">
              <Wrap gap={2} mb={3}>
                {SUGGESTED_KEYWORDS.map((keyword) => (
                  <Chip
                    key={keyword.id}
                    selected={keywordIds.includes(keyword.id)}
                    onClick={() => toggleKeyword(keyword)}
                  >
                    {keyword.name}
                  </Chip>
                ))}
                {customKeywords.map((keyword) => (
                  <RemovableChip key={keyword.id} label={keyword.name} onRemove={() => toggleKeyword(keyword)} />
                ))}
              </Wrap>
              <SearchPicker
                type="keyword"
                placeholder="Search for another subgenre"
                selectedIds={keywordIds}
                atLimit={keywords.length >= MAX_KEYWORDS}
                onAdd={(result) => setKeywords([...keywords, { id: result.id, name: result.name }])}
              />
              {keywords.length >= MAX_KEYWORDS && (
                <Text fontSize="xs" color="fg.muted" mt={2}>That&rsquo;s the maximum of {MAX_KEYWORDS}.</Text>
              )}
            </Section>

            <Section title="Story arcs">
              <Wrap gap={2}>
                {ARC_TYPES.map((arc) => (
                  <Chip key={arc} selected={arcTypes.includes(arc)} onClick={() => setArcTypes(toggleItem(arcTypes, arc))}>
                    {arc}
                  </Chip>
                ))}
              </Wrap>
            </Section>
          </>
        )}

        {current.key === "pairs" && (
          <PairPicker
            pairs={pairs}
            answers={comparisons}
            index={pairIndex}
            onAnswer={answerPair}
            onBack={() => setPairIndex(Math.max(0, pairIndex - 1))}
          />
        )}

        {current.key === "people" && (
          <Section title={`Directors and actors (up to ${MAX_PEOPLE})`}>
            {people.length > 0 && (
              <Wrap gap={2} mb={3}>
                {people.map((person) => (
                  <RemovableChip
                    key={`${person.role}-${person.id}`}
                    label={`${person.name} · ${person.role === "director" ? "Director" : "Actor"}`}
                    onRemove={() => setPeople(people.filter((p) => p !== person))}
                  />
                ))}
              </Wrap>
            )}
            <SearchPicker
              type="person"
              placeholder="Search for a director or actor"
              selectedIds={people.map((person) => person.id)}
              atLimit={people.length >= MAX_PEOPLE}
              onAdd={(result) =>
                setPeople([...people, { id: result.id, name: result.name, role: result.detail === "Acting" ? "actor" : "director" }])
              }
            />
          </Section>
        )}
      </Flex>

      <Flex justify="space-between" mt={8} gap={3}>
        <Button variant="ghost" size="sm" disabled={step === 0} onClick={() => setStep(step - 1)}>
          Back
        </Button>
        <Button colorPalette="orange" size="sm" loading={isLast && save.isPending} onClick={goNext}>
          {isLast ? "Finish" : "Next"}
        </Button>
      </Flex>
    </Box>
  );
}
