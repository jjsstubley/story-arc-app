import { Box, Button, Flex, SimpleGrid, Text, Textarea, Wrap } from "@chakra-ui/react";
import { useState, type ReactNode } from "react";
import { Chip, GenreChips, RemovableChip, toggleItem as toggle } from "./chips";
import SearchPicker from "./search-picker";
import StoryAxisControl from "./story-axis-control";
import { ERA_OPTIONS, LANGUAGE_OPTIONS, MAX_KEYWORDS, MAX_NOTES_LENGTH, MAX_PEOPLE, SUGGESTED_KEYWORDS } from "../options";
import { useSaveTastePreferences, useTastePreferences } from "../queries";
import { ARC_TYPES, STORY_AXES } from "../story";
import type { StoryAxes, TastePreferences } from "../types";

interface PreferencesEditorProps {
  /** Loaded by the page's loader */
  initialPreferences: TastePreferences;
  genres: { id: number; name: string }[];
}

function sameLists(a: unknown[], b: unknown[]) {
  return a.length === b.length && a.every((item) => b.includes(item));
}

function sameAxes(a: StoryAxes, b: StoryAxes) {
  return STORY_AXES.every(({ key }) => (a[key] ?? 0) === (b[key] ?? 0));
}

function isUnchanged(draft: TastePreferences, saved: TastePreferences) {
  return (
    sameLists(draft.favourite_genre_ids, saved.favourite_genre_ids) &&
    sameLists(draft.avoided_genre_ids, saved.avoided_genre_ids) &&
    sameLists(draft.eras, saved.eras) &&
    sameLists(draft.languages, saved.languages) &&
    (draft.notes?.trim() || null) === (saved.notes?.trim() || null) &&
    sameAxes(draft.story_axes, saved.story_axes) &&
    sameLists(draft.arc_types, saved.arc_types) &&
    sameLists(draft.keywords.map((k) => k.id), saved.keywords.map((k) => k.id)) &&
    sameLists(draft.people.map((p) => `${p.role}:${p.id}`), saved.people.map((p) => `${p.role}:${p.id}`))
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

export default function PreferencesEditor({ initialPreferences, genres }: PreferencesEditorProps) {
  const { data: saved = initialPreferences } = useTastePreferences({ initialData: initialPreferences });
  const savePreferences = useSaveTastePreferences();
  const [draft, setDraft] = useState<TastePreferences>(saved);
  const unchanged = isUnchanged(draft, saved);
  const notesTooLong = (draft.notes?.length ?? 0) > MAX_NOTES_LENGTH;

  const keywordIds = draft.keywords.map((keyword) => keyword.id);
  const toggleKeyword = (keyword: { id: number; name: string }) =>
    setDraft({
      ...draft,
      keywords: keywordIds.includes(keyword.id) ? draft.keywords.filter((k) => k.id !== keyword.id) : [...draft.keywords, keyword],
    });
  const customKeywords = draft.keywords.filter((keyword) => !SUGGESTED_KEYWORDS.some((suggested) => suggested.id === keyword.id));

  const setAxis = (key: keyof StoryAxes, score: number) => {
    const axes = { ...draft.story_axes };
    if (score === 0) delete axes[key];
    else axes[key] = score;
    setDraft({ ...draft, story_axes: axes });
  };

  return (
    <Flex direction="column" gap={6} p={5} rounded="lg" bg="blackAlpha.300" border="1px solid" borderColor="whiteAlpha.200">
      <Box>
        <Text fontSize="2xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="0.3em" color="orange.400" mb={1}>
          Your preferences
        </Text>
        <Text fontSize="sm" color="fg.muted">Tell us directly. These shape your profile, your lists and AI suggestions.</Text>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 8, lg: 10 }}>
        <Flex direction="column" gap={8}>
          <Group title="Story leanings" hint="Set from your film picks in the setup. The middle dot means no preference.">
            <Flex direction="column" gap={5}>
              {STORY_AXES.map((axis) => (
                <StoryAxisControl key={axis.key} axis={axis} value={draft.story_axes[axis.key]} onChange={(score) => setAxis(axis.key, score)} />
              ))}
            </Flex>
          </Group>

          <Group title="Story arcs" hint="Kinds of story you love.">
            <Wrap gap={2}>
              {ARC_TYPES.map((arc) => (
                <Chip key={arc} selected={draft.arc_types.includes(arc)} onClick={() => setDraft({ ...draft, arc_types: toggle(draft.arc_types, arc) })}>
                  {arc}
                </Chip>
              ))}
            </Wrap>
          </Group>

          <Group title="Subgenres" hint={`Up to ${MAX_KEYWORDS}. Search for any that aren't listed.`}>
            <Wrap gap={2} mb={3}>
              {SUGGESTED_KEYWORDS.map((keyword) => (
                <Chip key={keyword.id} selected={keywordIds.includes(keyword.id)} onClick={() => toggleKeyword(keyword)}>
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
              atLimit={draft.keywords.length >= MAX_KEYWORDS}
              onAdd={(result) => toggleKeyword({ id: result.id, name: result.name })}
            />
          </Group>
        </Flex>

        <Flex direction="column" gap={8}>
          <Group title="Genres" hint="Tap once to favour, twice to avoid. Avoided genres never appear in your lists.">
            <GenreChips
              genres={genres}
              favourite={draft.favourite_genre_ids}
              avoided={draft.avoided_genre_ids}
              onChange={({ favourite, avoided }) => setDraft({ ...draft, favourite_genre_ids: favourite, avoided_genre_ids: avoided })}
            />
          </Group>

          <Group title="Directors and actors" hint={`Up to ${MAX_PEOPLE} whose films you seek out.`}>
            {draft.people.length > 0 && (
              <Wrap gap={2} mb={3}>
                {draft.people.map((person) => (
                  <RemovableChip
                    key={`${person.role}-${person.id}`}
                    label={`${person.name} · ${person.role === "director" ? "Director" : "Actor"}`}
                    onRemove={() => setDraft({ ...draft, people: draft.people.filter((p) => p !== person) })}
                  />
                ))}
              </Wrap>
            )}
            <SearchPicker
              type="person"
              placeholder="Search for a director or actor"
              selectedIds={draft.people.map((person) => person.id)}
              atLimit={draft.people.length >= MAX_PEOPLE}
              onAdd={(result) =>
                setDraft({
                  ...draft,
                  people: [...draft.people, { id: result.id, name: result.name, role: result.detail === "Acting" ? "actor" : "director" }],
                })
              }
            />
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

          <Group title="In your own words" hint="Anything else, e.g. “morally grey leads, no jump scares”.">
            <Textarea
              value={draft.notes ?? ""}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              rows={3}
              maxLength={MAX_NOTES_LENGTH}
              placeholder="What do you look for in a film?"
            />
          </Group>
        </Flex>
      </SimpleGrid>

      <Flex justify="flex-end" gap={2}>
        <Button variant="ghost" size="sm" disabled={unchanged} onClick={() => setDraft(saved)}>
          Reset
        </Button>
        <Button
          colorPalette="orange"
          size="sm"
          disabled={unchanged || notesTooLong}
          onClick={() =>
            savePreferences.mutate({
              favourite_genre_ids: draft.favourite_genre_ids,
              avoided_genre_ids: draft.avoided_genre_ids,
              eras: draft.eras,
              languages: draft.languages,
              notes: draft.notes?.trim() || null,
              story_axes: draft.story_axes,
              arc_types: draft.arc_types,
              keywords: draft.keywords.map(({ id }) => ({ id })),
              people: draft.people.map(({ id, role }) => ({ id, role })),
            })
          }
        >
          Save preferences
        </Button>
      </Flex>
    </Flex>
  );
}
