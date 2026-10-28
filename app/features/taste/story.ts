// Story vocabulary shared by onboarding, the preferences editor and prompts. Client and server safe.

/** Each axis is scored from -2 (low end) to 2 (high end); a missing axis means no preference */
export const STORY_AXES = [
  { key: "ending", low: "Hopeful endings", high: "Bleak or tragic endings" },
  { key: "pacing", low: "Slow burn", high: "Propulsive" },
  { key: "structure", low: "Linear, classic", high: "Non-linear, puzzle-box" },
  { key: "focus", low: "Character-driven", high: "Plot-driven" },
  { key: "tone", low: "Light", high: "Dark" },
  { key: "resolution", low: "Everything resolved", high: "Open, ambiguous" },
] as const;

export type StoryAxisKey = (typeof STORY_AXES)[number]["key"];

export const STORY_AXIS_MIN = -2;
export const STORY_AXIS_MAX = 2;

export const ARC_TYPES = [
  "Redemption",
  "Coming of age",
  "Rise and fall",
  "Hero's journey",
  "Revenge",
  "Rags to riches",
  "Voyage and return",
  "Rebirth",
  "Overcoming the monster",
  "Tragedy",
] as const;

export interface ComparisonFilm {
  tmdbId: number;
  title: string;
  year: string;
}

/**
 * Two films at opposite ends of one story axis, close in genre so the choice
 * is mostly about that axis. Shaped like a future `taste_comparison_pairs`
 * row: answers are stored by `id`, so never reuse or renumber an id; set
 * `active: false` to retire a pair instead.
 */
export interface ComparisonPair {
  id: string;
  axis: StoryAxisKey;
  low: ComparisonFilm;
  high: ComparisonFilm;
  active: boolean;
}

export const COMPARISON_PAIRS: ComparisonPair[] = [
  { id: "ending-1", axis: "ending", low: { tmdbId: 1366, title: "Rocky", year: "1976" }, high: { tmdbId: 1578, title: "Raging Bull", year: "1980" }, active: true },
  { id: "ending-2", axis: "ending", low: { tmdbId: 286217, title: "The Martian", year: "2015" }, high: { tmdbId: 1272, title: "Sunshine", year: "2007" }, active: true },
  { id: "ending-3", axis: "ending", low: { tmdbId: 639, title: "When Harry Met Sally...", year: "1989" }, high: { tmdbId: 46705, title: "Blue Valentine", year: "2010" }, active: true },
  { id: "ending-4", axis: "ending", low: { tmdbId: 5503, title: "The Fugitive", year: "1993" }, high: { tmdbId: 6977, title: "No Country for Old Men", year: "2007" }, active: true },
  { id: "pacing-1", axis: "pacing", low: { tmdbId: 64690, title: "Drive", year: "2011" }, high: { tmdbId: 245891, title: "John Wick", year: "2014" }, active: true },
  { id: "pacing-2", axis: "pacing", low: { tmdbId: 335984, title: "Blade Runner 2049", year: "2017" }, high: { tmdbId: 603, title: "The Matrix", year: "1999" }, active: true },
  { id: "pacing-3", axis: "pacing", low: { tmdbId: 310131, title: "The Witch", year: "2016" }, high: { tmdbId: 170, title: "28 Days Later", year: "2002" }, active: true },
  { id: "structure-1", axis: "structure", low: { tmdbId: 320, title: "Insomnia", year: "2002" }, high: { tmdbId: 77, title: "Memento", year: "2000" }, active: true },
  { id: "structure-2", axis: "structure", low: { tmdbId: 184, title: "Jackie Brown", year: "1997" }, high: { tmdbId: 680, title: "Pulp Fiction", year: "1994" }, active: true },
  { id: "structure-3", axis: "structure", low: { tmdbId: 76, title: "Before Sunrise", year: "1995" }, high: { tmdbId: 38, title: "Eternal Sunshine of the Spotless Mind", year: "2004" }, active: true },
  { id: "focus-1", axis: "focus", low: { tmdbId: 334541, title: "Manchester by the Sea", year: "2016" }, high: { tmdbId: 146233, title: "Prisoners", year: "2013" }, active: true },
  { id: "focus-2", axis: "focus", low: { tmdbId: 152601, title: "Her", year: "2013" }, high: { tmdbId: 27205, title: "Inception", year: "2010" }, active: true },
  { id: "focus-3", axis: "focus", low: { tmdbId: 85350, title: "Boyhood", year: "2014" }, high: { tmdbId: 105, title: "Back to the Future", year: "1985" }, active: true },
  { id: "tone-1", axis: "tone", low: { tmdbId: 118340, title: "Guardians of the Galaxy", year: "2014" }, high: { tmdbId: 155, title: "The Dark Knight", year: "2008" }, active: true },
  { id: "tone-2", axis: "tone", low: { tmdbId: 862, title: "Toy Story", year: "1995" }, high: { tmdbId: 12477, title: "Grave of the Fireflies", year: "1988" }, active: true },
  { id: "tone-3", axis: "tone", low: { tmdbId: 546554, title: "Knives Out", year: "2019" }, high: { tmdbId: 210577, title: "Gone Girl", year: "2014" }, active: true },
  { id: "tone-4", axis: "tone", low: { tmdbId: 1584, title: "The School of Rock", year: "2003" }, high: { tmdbId: 244786, title: "Whiplash", year: "2014" }, active: true },
  { id: "resolution-1", axis: "resolution", low: { tmdbId: 807, title: "Se7en", year: "1995" }, high: { tmdbId: 1949, title: "Zodiac", year: "2007" }, active: true },
  { id: "resolution-2", axis: "resolution", low: { tmdbId: 157336, title: "Interstellar", year: "2014" }, high: { tmdbId: 62, title: "2001: A Space Odyssey", year: "1968" }, active: true },
  { id: "resolution-3", axis: "resolution", low: { tmdbId: 419430, title: "Get Out", year: "2017" }, high: { tmdbId: 270303, title: "It Follows", year: "2015" }, active: true },
];

/** "low"/"high" pick that end's film; "both" and "neither" leave the axis alone */
export const COMPARISON_PICKS = ["low", "high", "both", "neither"] as const;
export type ComparisonPick = (typeof COMPARISON_PICKS)[number];

export function getComparisonPair(id: string): ComparisonPair | undefined {
  return COMPARISON_PAIRS.find((pair) => pair.id === id);
}

export function getStoryAxis(key: string) {
  return STORY_AXES.find((axis) => axis.key === key);
}

/**
 * Axis scores implied by pair answers: each "low" or "high" pick moves its
 * axis by one, capped at the axis limits. Axes with no net lean are left out.
 */
export function axesFromComparisons(answers: { pair: string; pick: ComparisonPick }[]): Partial<Record<StoryAxisKey, number>> {
  const axes: Partial<Record<StoryAxisKey, number>> = {};
  for (const { pair: pairId, pick } of answers) {
    const pair = getComparisonPair(pairId);
    if (!pair || (pick !== "low" && pick !== "high")) continue;
    axes[pair.axis] = (axes[pair.axis] ?? 0) + (pick === "high" ? 1 : -1);
  }
  for (const key of Object.keys(axes) as StoryAxisKey[]) {
    const score = Math.max(STORY_AXIS_MIN, Math.min(STORY_AXIS_MAX, axes[key]!));
    if (score === 0) delete axes[key];
    else axes[key] = score;
  }
  return axes;
}
