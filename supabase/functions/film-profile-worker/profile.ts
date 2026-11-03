import OpenAI from "npm:openai@4.73.1";
import {
  ARC_TYPES,
  CHARACTER_ARCS,
  CONFLICTS,
  DEVICES,
  EMOTIONAL_EFFECTS,
  ENDING_TYPES,
  MOODS,
  PROTAGONISTS,
  SETTING_SCALES,
  STORY_AXES,
  THEMES,
  VOCAB_VERSION,
  WATCH_CONTEXTS,
} from "../_shared/film-vocabulary.ts";
import type { MovieRow } from "./tmdb.ts";

export const PROFILE_MODEL = "gpt-4o-mini";
export const EMBEDDING_MODEL = "text-embedding-3-small";
/** Bump when the prompt changes in a way that should regenerate profiles */
const PROMPT_VERSION = 1;

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

const AXIS_SCORE = { type: "integer", enum: [-2, -1, 0, 1, 2] } as const;
const LEVEL = { type: "integer", enum: [0, 1, 2, 3], description: "0 none, 1 low, 2 moderate, 3 high" } as const;
const pickMany = (values: readonly string[], description: string) =>
  ({ type: "array", description, items: { type: "string", enum: [...values] } }) as const;

const profileSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "logline", "axes", "arc_type", "character_arc", "ending_type", "conflict", "protagonist",
    "moral_complexity", "violence", "tension", "themes", "moods", "emotional_effects", "devices",
    "watch_contexts", "tropes", "setting_era", "setting_scale", "confidence",
  ],
  properties: {
    logline: {
      type: "string",
      description: "One spoiler-free sentence on what kind of story this is: its shape and feel, not its plot events",
    },
    axes: {
      type: "object",
      additionalProperties: false,
      required: STORY_AXES.map((axis) => axis.key),
      properties: Object.fromEntries(
        STORY_AXES.map((axis) => [axis.key, { ...AXIS_SCORE, description: `-2 = ${axis.low}, 2 = ${axis.high}` }])
      ),
    },
    arc_type: { type: "string", enum: [...ARC_TYPES] },
    character_arc: { type: "string", enum: [...CHARACTER_ARCS] },
    ending_type: { type: "string", enum: [...ENDING_TYPES] },
    conflict: { type: "string", enum: [...CONFLICTS], description: "The central conflict" },
    protagonist: { type: "string", enum: [...PROTAGONISTS] },
    moral_complexity: { ...LEVEL, description: "0 clear good vs evil, 3 everyone morally grey" },
    violence: LEVEL,
    tension: LEVEL,
    themes: pickMany(THEMES, "The 2-5 most central themes, most central first"),
    moods: pickMany(MOODS, "The 1-3 dominant moods"),
    emotional_effects: pickMany(EMOTIONAL_EFFECTS, "How it leaves most viewers feeling, 1-3"),
    devices: pickMany(DEVICES, "Storytelling devices it clearly uses; empty if none"),
    watch_contexts: pickMany(WATCH_CONTEXTS, "Situations it suits, 0-3"),
    tropes: { type: "array", items: { type: "string" }, description: "Up to 5 short premise or trope tags, e.g. 'heist', 'fish out of water'" },
    setting_era: { type: "string", description: "When it's set, e.g. '1970s', 'Near future', 'Medieval'" },
    setting_scale: { type: "string", enum: [...SETTING_SCALES] },
    confidence: {
      type: "number",
      description: "0-1: how sure you are of this profile. Below 0.5 if you had little plot detail and don't know the film well",
    },
  },
} as const;

export interface GeneratedProfile {
  logline: string;
  axes: Record<(typeof STORY_AXES)[number]["key"], number>;
  arc_type: string;
  character_arc: string;
  ending_type: string;
  conflict: string;
  protagonist: string;
  moral_complexity: number;
  violence: number;
  tension: number;
  themes: string[];
  moods: string[];
  emotional_effects: string[];
  devices: string[];
  watch_contexts: string[];
  tropes: string[];
  setting_era: string;
  setting_scale: string;
  confidence: number;
}

export interface ProfileInput {
  movie: MovieRow;
  genreNames: string[];
  plot: string | null;
}

export async function sourceHash({ movie, plot }: ProfileInput): Promise<string> {
  const source = JSON.stringify([VOCAB_VERSION, PROMPT_VERSION, PROFILE_MODEL, EMBEDDING_MODEL, movie.overview, movie.keywords, plot]);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(source));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function describeFilm({ movie, genreNames, plot }: ProfileInput): string {
  return [
    `Title: ${movie.title} (${movie.release_date?.slice(0, 4) ?? "year unknown"})`,
    genreNames.length && `Genres: ${genreNames.join(", ")}`,
    movie.keywords.length && `TMDB keywords: ${movie.keywords.slice(0, 30).join(", ")}`,
    movie.overview && `Overview: ${movie.overview}`,
    plot ? `Full plot (Wikipedia):\n${plot}` : "No full plot is available.",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function generateProfile(input: ProfileInput): Promise<GeneratedProfile> {
  const response = await openai.chat.completions.create({
    model: PROFILE_MODEL,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You profile films by their story: its arc, how its characters change, how it ends and how it feels. " +
          "Base the profile on the plot you're given. Use your own knowledge of the film only to fill gaps, " +
          "and lower your confidence when you do. Score each axis relative to films in general, using 0 when " +
          "the film sits in the middle or the axis doesn't apply.",
      },
      { role: "user", content: describeFilm(input) },
    ],
    response_format: { type: "json_schema", json_schema: { name: "film_story_profile", strict: true, schema: profileSchema } },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty story profile response");
  const profile = JSON.parse(content) as GeneratedProfile;
  // Strict mode can't cap array lengths
  return {
    ...profile,
    themes: profile.themes.slice(0, 5),
    moods: profile.moods.slice(0, 3),
    emotional_effects: profile.emotional_effects.slice(0, 3),
    watch_contexts: profile.watch_contexts.slice(0, 3),
    tropes: profile.tropes.map((trope) => trope.trim().toLowerCase()).filter(Boolean).slice(0, 5),
    confidence: Math.min(1, Math.max(0, profile.confidence)),
  };
}

/**
 * The text that gets embedded. Story qualities only, not plot details or the
 * title, so films are close when their stories feel alike.
 */
export function buildStoryCard(profile: GeneratedProfile, genreNames: string[]): string {
  const axes = STORY_AXES.flatMap((axis) => {
    const score = profile.axes[axis.key];
    if (!score) return [];
    return [`${Math.abs(score) >= 2 ? "strongly" : "somewhat"} ${(score < 0 ? axis.low : axis.high).toLowerCase()}`];
  });
  return [
    profile.logline,
    `${profile.arc_type} story; ${profile.character_arc.toLowerCase()} character arc; ${profile.ending_type.toLowerCase()} ending.`,
    `Conflict with ${profile.conflict.toLowerCase()}; protagonist: ${profile.protagonist.toLowerCase()}.`,
    axes.length > 0 && `Story leanings: ${axes.join("; ")}.`,
    `Themes: ${profile.themes.join(", ")}.`,
    `Mood: ${profile.moods.join(", ")}. Effect on the viewer: ${profile.emotional_effects.join(", ").toLowerCase()}.`,
    profile.devices.length > 0 && `Devices: ${profile.devices.join(", ")}.`,
    profile.tropes.length > 0 && `Tropes: ${profile.tropes.join(", ")}.`,
    genreNames.length > 0 && `Genres: ${genreNames.join(", ")}.`,
    `Setting: ${profile.setting_era}; scale: ${profile.setting_scale.toLowerCase()}.`,
  ]
    .filter(Boolean)
    .join(" ");
}

export async function embed(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: text });
  return response.data[0].embedding;
}
