// Story vocabulary shared by the app (via ~/features/films and ~/features/taste)
// and the film-profile-worker Edge Function. No imports: Deno and Vite both
// load this file directly.
//
// Film story profiles are generated against these lists. Changing a list
// means bumping VOCAB_VERSION and requeueing films, or old profiles will use
// values that no longer exist. Add values freely; rename or remove carefully.

export const VOCAB_VERSION = 1;

/** Each axis is scored from -2 (low end) to 2 (high end); a missing axis means no preference */
export const STORY_AXES = [
  { key: "ending", low: "Hopeful endings", high: "Bleak or tragic endings" },
  { key: "pacing", low: "Slow burn", high: "Propulsive" },
  { key: "structure", low: "Linear, classic", high: "Non-linear, puzzle-box" },
  { key: "focus", low: "Character-driven", high: "Plot-driven" },
  { key: "tone", low: "Light", high: "Dark" },
  { key: "resolution", low: "Everything resolved", high: "Open, ambiguous" },
] as const;

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

/** How the protagonist changes. Spoiler: match on it, don't show it. */
export const CHARACTER_ARCS = [
  "Positive change",
  "Fall or corruption",
  "Disillusionment",
  "Flat (changes the world, not themselves)",
  "Redemption",
  "Ensemble (no single arc)",
] as const;

/** Spoiler: match on it, don't show it */
export const ENDING_TYPES = [
  "Happy",
  "Bittersweet",
  "Tragic",
  "Ambiguous",
  "Twist",
  "Cliffhanger",
  "Circular",
] as const;

export const CONFLICTS = [
  "Self",
  "Another person",
  "Society",
  "Nature",
  "Technology or the system",
  "Supernatural",
  "Fate",
] as const;

export const PROTAGONISTS = [
  "Lone hero",
  "Antihero",
  "Ensemble",
  "Duo or couple",
  "Unreliable narrator",
  "Child or teen",
  "Villain",
  "Everyman",
] as const;

export const THEMES = [
  "Grief and loss",
  "Love and romance",
  "Family",
  "Friendship",
  "Found family",
  "Identity",
  "Memory",
  "Isolation and loneliness",
  "Ambition",
  "Power and corruption",
  "Justice",
  "Revenge",
  "Guilt and atonement",
  "Faith and doubt",
  "Morality",
  "Survival",
  "Freedom",
  "Class and inequality",
  "Race and prejudice",
  "War",
  "Crime",
  "Obsession",
  "Addiction",
  "Mental illness",
  "Ageing and mortality",
  "Growing up",
  "Parenthood",
  "Betrayal",
  "Trust",
  "Sacrifice",
  "Technology and humanity",
  "Nature and environment",
  "Art and creativity",
  "Fame",
  "Truth and deception",
  "Fate and free will",
  "Home and belonging",
  "Masculinity",
  "Womanhood",
  "Coming out",
] as const;

export const MOODS = [
  "Melancholic",
  "Tense",
  "Dreamy",
  "Whimsical",
  "Gritty",
  "Romantic",
  "Eerie",
  "Bleak",
  "Warm",
  "Playful",
  "Brooding",
  "Frantic",
  "Contemplative",
  "Nostalgic",
  "Menacing",
  "Euphoric",
  "Absurd",
  "Intimate",
  "Epic",
  "Sardonic",
] as const;

/** How the film leaves you feeling */
export const EMOTIONAL_EFFECTS = [
  "Cathartic",
  "Comforting",
  "Uplifting",
  "Devastating",
  "Unsettling",
  "Haunting",
  "Thrilling",
  "Thought-provoking",
  "Funny",
  "Inspiring",
] as const;

export const DEVICES = [
  "Twist ending",
  "Non-linear timeline",
  "Multiple timelines",
  "Framing device",
  "Time loop",
  "Unreliable narration",
  "Voiceover narration",
  "Single location",
  "Real time",
  "Found footage",
  "Anthology",
  "Breaking the fourth wall",
] as const;

export const WATCH_CONTEXTS = [
  "Comfort rewatch",
  "Date night",
  "With family",
  "With friends",
  "Needs full attention",
  "Late night",
] as const;

export const SETTING_SCALES = ["Intimate", "Mid-scale", "Epic"] as const;
