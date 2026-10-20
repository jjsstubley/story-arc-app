
import { ProviderEvent, SuggestionProvider, SuggestionRequest, MovieSuggestion } from "../suggestionProvider";

// NEEDS TO BE REPLACED WITH ACTUAL GEMINI API CALLS
// Non-streaming placeholder: yields the full parsed result once the response arrives.

export const GeminiProvider: SuggestionProvider = {
  async *streamSuggestions({ query, excludeTitles, page }: SuggestionRequest): AsyncIterable<ProviderEvent> {
    // Construct and send Gemini prompt
    const response = await fetch("https://gemini-api", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.GEMINI_KEY}` },
      body: JSON.stringify({ query, previousTitles: excludeTitles, page })
    });

    const json = await response.json() as { title: string; suggestions: MovieSuggestion[] };
    yield { type: "title", title: json.title };
    for (const suggestion of json.suggestions) {
      yield { type: "suggestion", suggestion };
    }
  },
};
