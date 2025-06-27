import { SuggestionProvider } from "./suggestionProvider";
import { OpenAiProvider } from "./providers/openai";
// import { GeminiProvider } from "~/ai/providers/gemini";
import { getMovieBySearchQuery } from "~/utils/services/external/tmdb/search";
import { json } from "@remix-run/node";

// const provider: SuggestionProvider =
//   process.env.AI_PROVIDER === "gemini"
//     ? GeminiSuggestionProvider
//     : OpenAiProvider;

const provider: SuggestionProvider = OpenAiProvider

export async function getSuggestions(query: string) {
  try {
    const rawData = await provider.getSuggestions(query);

    console.log('getSuggestions rawData', rawData)

    const enriched = {
      title: rawData.title,
      suggestions: await Promise.all(
        rawData.suggestions.map(async (movie: {title: string, year: string}) => {
          const tmdbData = await getMovieBySearchQuery({
            title: movie.title,
            year: movie.year,
          });

          const bestMatch = tmdbData.results?.[0] || null;
          return { ...movie, tmdbData: bestMatch };
        })
      ),
    };
    

    return json({ result: enriched });
  } catch (error) {
    console.error(error);
    return json({ error: "Failed to fetch AI suggestions" }, { status: 500 });
  }
}