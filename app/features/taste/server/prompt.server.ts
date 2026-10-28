import { getComparisonPair, getStoryAxis } from "../story";
import type { ComparisonAnswer, ResolvedPreferences, StoryAxes, TasteContext } from "../types";

const DISLIKED_TIERS = ["Bad", "Awful"];

/** e.g. "strongly prefers slow burn; leans toward bleak or tragic endings" */
function describeStoryAxes(axes: StoryAxes): string {
  return Object.entries(axes)
    .flatMap(([key, score]) => {
      const axis = getStoryAxis(key);
      if (!axis || !score) return [];
      const end = (score < 0 ? axis.low : axis.high).toLowerCase();
      return [`${Math.abs(score) >= 2 ? "strongly prefers" : "leans toward"} ${end}`];
    })
    .join("; ");
}

/** e.g. "preferred Memento (2000) over Insomnia (2002) (non-linear, puzzle-box over linear, classic)" */
function describeComparisons(comparisons: ComparisonAnswer[]): string {
  return comparisons
    .flatMap(({ pair: pairId, pick }) => {
      const pair = getComparisonPair(pairId);
      const axis = pair && getStoryAxis(pair.axis);
      if (!pair || !axis) return [];
      const film = (end: "low" | "high") => `${pair[end].title} (${pair[end].year})`;
      if (pick === "both") return [`liked the sound of both ${film("low")} and ${film("high")}`];
      if (pick === "neither") return [`liked the sound of neither ${film("low")} nor ${film("high")}`];
      const other = pick === "low" ? "high" : "low";
      return [`preferred ${film(pick)} over ${film(other)} (${axis[pick].toLowerCase()} over ${axis[other].toLowerCase()})`];
    })
    .join("; ");
}

export function describePreferences(preferences: ResolvedPreferences | null): string {
  if (!preferences) return "";
  const story = describeStoryAxes(preferences.storyAxes);
  const comparisons = describeComparisons(preferences.comparisons);
  const lines = [
    preferences.favouriteGenres.length && `Favourite genres: ${preferences.favouriteGenres.join(", ")}`,
    preferences.avoidedGenres.length && `Never suggest these genres: ${preferences.avoidedGenres.join(", ")}`,
    preferences.subgenres.length && `Favourite subgenres: ${preferences.subgenres.join(", ")}`,
    story && `Story leanings: ${story}`,
    preferences.arcTypes.length && `Story arcs they love: ${preferences.arcTypes.join(", ")}`,
    comparisons && `When choosing between two films, they ${comparisons}`,
    preferences.directors.length && `Favourite directors: ${preferences.directors.join(", ")}`,
    preferences.actors.length && `Favourite actors: ${preferences.actors.join(", ")}`,
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
