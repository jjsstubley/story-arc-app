// Public client-safe API of the films feature. Import from "~/features/films" only.
export { default as SimilarStories } from "./components/similar-stories";
export { filmKeys, useSimilarStories } from "./queries";
export * from "./vocabulary";
export type { FilmStoryProfile, Movie, SimilarStories as SimilarStoriesResult, SimilarStory } from "./types";
