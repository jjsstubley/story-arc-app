import type { ResolvedPreferences, TasteContext } from "../types";

const DISLIKED_TIERS = ["Bad", "Awful"];

export function describePreferences(preferences: ResolvedPreferences | null): string {
  if (!preferences) return "";
  const lines = [
    preferences.favouriteGenres.length && `Favourite genres: ${preferences.favouriteGenres.join(", ")}`,
    preferences.avoidedGenres.length && `Never suggest these genres: ${preferences.avoidedGenres.join(", ")}`,
    preferences.eras.length && `Preferred eras: ${preferences.eras.join(", ")}`,
    preferences.languages.length && `Preferred original languages: ${preferences.languages.join(", ")}`,
    preferences.notes && `In their own words: "${preferences.notes}"`,
  ];
  return lines.filter(Boolean).join("\n");
}

/** The "User taste" section given to the model for suggestions and "For you" lists */
export function describeTaste(taste: TasteContext): string {
  const titles = (tiers: (tier: string) => boolean, withTier = false) =>
    taste.anchors
      .filter((anchor) => tiers(anchor.tier))
      .map((anchor) => `${anchor.title} (${anchor.year})${withTier ? ` — ${anchor.tier}` : ""}`);

  const loved = titles((tier) => !DISLIKED_TIERS.includes(tier) && tier !== "Watched" && tier !== "Watchlist", true);
  const disliked = titles((tier) => DISLIKED_TIERS.includes(tier));
  const watched = titles((tier) => tier === "Watched");
  const wanted = titles((tier) => tier === "Watchlist");

  return [
    "User taste:",
    taste.summary,
    taste.likes.length && `Likes: ${taste.likes.join(", ")}`,
    taste.dislikes.length && `Dislikes: ${taste.dislikes.join(", ")}`,
    loved.length && `Highly rated or favourite films: ${loved.join("; ")}`,
    disliked.length && `Rated poorly: ${disliked.join("; ")}`,
    watched.length && `Recently watched: ${watched.join("; ")}`,
    wanted.length && `Wants to watch: ${wanted.join("; ")}`,
    describePreferences(taste.preferences),
  ]
    .filter(Boolean)
    .join("\n");
}
