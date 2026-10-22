import { Box, Button, Flex, Text, Textarea, Wrap } from "@chakra-ui/react";
import { useState, type ReactNode } from "react";
import { LuMinus, LuPlus } from "react-icons/lu";
import { ERA_OPTIONS, LANGUAGE_OPTIONS, MAX_NOTES_LENGTH } from "../options";
import { useSaveTastePreferences, useTastePreferences } from "../queries";
import type { TastePreferences } from "../types";

interface PreferencesEditorProps {
  /** Loaded by the page's loader */
  initialPreferences: TastePreferences;
  genres: { id: number; name: string }[];
}

function sameLists(a: unknown[], b: unknown[]) {
  return a.length === b.length && a.every((item) => b.includes(item));
}

function isUnchanged(draft: TastePreferences, saved: TastePreferences) {
  return (
    sameLists(draft.favourite_genre_ids, saved.favourite_genre_ids) &&
    sameLists(draft.avoided_genre_ids, saved.avoided_genre_ids) &&
    sameLists(draft.eras, saved.eras) &&
    sameLists(draft.languages, saved.languages) &&
    (draft.notes?.trim() || null) === (saved.notes?.trim() || null)
  );
}

function Group({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <Box>
      <Text fontWeight="semibold" fontSize="sm">{title}</Text>
      <Text fontSize="xs" color="fg.muted" mb={3}>{hint}</Text>
      {children}
    </Box>
  );
}

function Chip({ selected, onClick, children, label }: { selected: boolean; onClick: () => void; children: ReactNode; label?: string }) {
  return (
    <Button
      size="xs"
      rounded="full"
      variant={selected ? "solid" : "outline"}
      colorPalette={selected ? "orange" : "gray"}
      aria-pressed={selected}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export default function PreferencesEditor({ initialPreferences, genres }: PreferencesEditorProps) {
  const { data: saved = initialPreferences } = useTastePreferences({ initialData: initialPreferences });
  const savePreferences = useSaveTastePreferences();
  const [draft, setDraft] = useState<TastePreferences>(saved);
  const unchanged = isUnchanged(draft, saved);
  const notesTooLong = (draft.notes?.length ?? 0) > MAX_NOTES_LENGTH;

  const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

  // Each genre cycles: no preference → favour → avoid → no preference
  const cycleGenre = (id: number) => {
    setDraft((current) => {
      const favoured = current.favourite_genre_ids.includes(id);
      const avoided = current.avoided_genre_ids.includes(id);
      return {
        ...current,
        favourite_genre_ids: favoured ? current.favourite_genre_ids.filter((g) => g !== id) : avoided ? current.favourite_genre_ids : [...current.favourite_genre_ids, id],
        avoided_genre_ids: favoured ? [...current.avoided_genre_ids, id] : current.avoided_genre_ids.filter((g) => g !== id),
      };
    });
  };

  return (
    <Flex direction="column" gap={6} p={5} rounded="lg" bg="blackAlpha.300" border="1px solid" borderColor="whiteAlpha.200">
      <Box>
        <Text fontSize="2xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="0.3em" color="orange.400" mb={1}>
          Your preferences
        </Text>
        <Text fontSize="sm" color="fg.muted">Tell us directly. These shape your profile, your lists and AI suggestions.</Text>
      </Box>

      <Group title="Genres" hint="Tap once to favour, twice to avoid. Avoided genres never appear in your lists.">
        <Wrap gap={2}>
          {genres.map((genre) => {
            const favoured = draft.favourite_genre_ids.includes(genre.id);
            const avoided = draft.avoided_genre_ids.includes(genre.id);
            return (
              <Button
                key={genre.id}
                size="xs"
                rounded="full"
                variant={favoured || avoided ? "subtle" : "outline"}
                colorPalette={favoured ? "green" : avoided ? "red" : "gray"}
                aria-label={`${genre.name}: ${favoured ? "favoured" : avoided ? "avoided" : "no preference"}`}
                onClick={() => cycleGenre(genre.id)}
              >
                {favoured && <LuPlus />}
                {avoided && <LuMinus />}
                {genre.name}
              </Button>
            );
          })}
        </Wrap>
      </Group>

      <Group title="Eras" hint="Leave empty for any era.">
        <Wrap gap={2}>
          {ERA_OPTIONS.map((era) => (
            <Chip key={era} selected={draft.eras.includes(era)} onClick={() => setDraft({ ...draft, eras: toggle(draft.eras, era) })}>
              {era}
            </Chip>
          ))}
        </Wrap>
      </Group>

      <Group title="Original language" hint="Leave empty for any language.">
        <Wrap gap={2}>
          {LANGUAGE_OPTIONS.map((language) => (
            <Chip
              key={language.code}
              selected={draft.languages.includes(language.code)}
              onClick={() => setDraft({ ...draft, languages: toggle(draft.languages, language.code) })}
            >
              {language.label}
            </Chip>
          ))}
        </Wrap>
      </Group>

      <Group title="In your own words" hint="Anything else, e.g. “slow-burn, morally grey leads, no jump scares”.">
        <Textarea
          value={draft.notes ?? ""}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          rows={3}
          maxLength={MAX_NOTES_LENGTH}
          placeholder="What do you look for in a film?"
        />
      </Group>

      <Flex justify="flex-end" gap={2}>
        <Button variant="ghost" size="sm" disabled={unchanged} onClick={() => setDraft(saved)}>
          Reset
        </Button>
        <Button
          colorPalette="orange"
          size="sm"
          disabled={unchanged || notesTooLong}
          onClick={() => savePreferences.mutate({ ...draft, notes: draft.notes?.trim() || null })}
        >
          Save preferences
        </Button>
      </Flex>
    </Flex>
  );
}
