import { getSimilarStories } from "~/features/films/index.server";
import { publicApiRoute, requireIntParam } from "~/shared/api/route.server";

const SIMILAR_STORIES_COUNT = 12;

// Story profiles are public film data, so this works signed out
export const loader = publicApiRoute({
  GET: ({ params, supabase }) => getSimilarStories(requireIntParam(params, "movieId"), SIMILAR_STORIES_COUNT, supabase),
});
