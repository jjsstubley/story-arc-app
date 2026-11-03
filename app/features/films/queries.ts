import { useQuery } from "@tanstack/react-query";
import { fetchSimilarStories } from "./api";

export const filmKeys = {
  all: ["films"] as const,
  similar: (movieId: number) => [...filmKeys.all, "similar", movieId] as const,
};

/** Profiles only change when the worker regenerates them, so this rarely needs refetching */
export function useSimilarStories(movieId: number) {
  return useQuery({
    queryKey: filmKeys.similar(movieId),
    queryFn: ({ signal }) => fetchSimilarStories(movieId, signal),
    staleTime: 60 * 60 * 1000,
  });
}
