// Story similarity between two profiled films. Vector distance alone is noisy
// (every story card shares the same template, so similarities bunch up), so
// candidates from the vector search are re-ranked on the structured profile.
// Client and server safe: no imports beyond types.

import type { ScoredProfile } from "./types";

const AXES = ["axis_ending", "axis_pacing", "axis_structure", "axis_focus", "axis_tone", "axis_resolution"] as const;
/** Each axis runs -2..2, so two films can differ by at most 4 on one */
const MAX_AXIS_GAP = 4;

const WEIGHTS = {
  vector: 0.25,
  axes: 0.15,
  themes: 0.15,
  feel: 0.1,
  genres: 0.1,
  shape: 0.1,
  premise: 0.15,
} as const;

function jaccard<T>(a: readonly T[], b: readonly T[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const set = new Set(a);
  const shared = b.filter((value) => set.has(value)).length;
  return shared / (set.size + b.length - shared);
}

/** Shared / smaller set: a few specific shared keywords count even when one film has many */
function overlap<T>(a: readonly T[], b: readonly T[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const set = new Set(a);
  return b.filter((value) => set.has(value)).length / Math.min(set.size, b.length);
}

/** 1 when every story axis matches, 0 when every axis is at opposite ends */
export function axisCloseness(a: ScoredProfile, b: ScoredProfile): number {
  const gap = AXES.reduce((sum, axis) => sum + Math.abs(a[axis] - b[axis]), 0);
  return 1 - gap / (AXES.length * MAX_AXIS_GAP);
}

/** Arc, ending and conflict: the shape of the story */
function shapeMatch(a: ScoredProfile, b: ScoredProfile): number {
  return (
    (a.arc_type === b.arc_type ? 0.4 : 0) +
    (a.ending_type === b.ending_type ? 0.3 : 0) +
    (a.character_arc === b.character_arc ? 0.15 : 0) +
    (a.conflict === b.conflict ? 0.15 : 0)
  );
}

/**
 * 0..1. `vectorScore` is the candidate's embedding similarity, already
 * normalised to 0..1 across the candidate set (see normaliseSimilarities).
 */
export function storySimilarity(seed: ScoredProfile, candidate: ScoredProfile, vectorScore: number): number {
  return (
    WEIGHTS.vector * vectorScore +
    WEIGHTS.axes * axisCloseness(seed, candidate) +
    WEIGHTS.themes * jaccard(seed.themes, candidate.themes) +
    WEIGHTS.feel * (jaccard(seed.moods, candidate.moods) + jaccard(seed.emotional_effects, candidate.emotional_effects)) / 2 +
    WEIGHTS.genres * jaccard(seed.genre_ids, candidate.genre_ids) +
    WEIGHTS.shape * shapeMatch(seed, candidate) +
    // What it's about (boxing, heist, time travel): TMDB keywords plus the profile's tropes
    WEIGHTS.premise * overlap([...seed.keywords, ...seed.tropes], [...candidate.keywords, ...candidate.tropes])
  );
}

/** Min-max scales raw cosine similarities to 0..1 so their spread counts, not their level */
export function normaliseSimilarities(similarities: number[]): (similarity: number) => number {
  const min = Math.min(...similarities);
  const range = Math.max(...similarities) - min;
  return (similarity) => (range > 0 ? (similarity - min) / range : 1);
}

/** What two films have in common that's safe to show (never endings or arcs) */
export function sharedTraits(seed: ScoredProfile, candidate: ScoredProfile) {
  return {
    sharedThemes: candidate.themes.filter((theme) => seed.themes.includes(theme)),
    sharedMoods: candidate.moods.filter((mood) => seed.moods.includes(mood)),
  };
}
