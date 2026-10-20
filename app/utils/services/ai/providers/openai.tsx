
import OpenAI from "openai";
import { ProviderEvent, SuggestionProvider, SuggestionRequest, MovieSuggestion } from "../suggestionProvider";
import { createSuggestionStreamParser } from "../json-stream";
import type { TasteProfile } from "~/utils/services/supabase/taste-profiles.server";

// In Remix server-side code, use process.env
const apiKey = process.env.OPENAI_API_KEY;

export const openai = new OpenAI({
  apiKey: apiKey,
});

export const OPENAI_MODEL = "gpt-4o-mini";

const MAX_EXCLUDED_TITLES = 150;

const systemPrompt = `
You are a film and TV recommendation expert. Help users find the most fitting titles based on story structure, character arcs, themes, tone, and symbolic elements.

**Story Structure (Freytag’s Pyramid)**
Analyze exposition (setting, tone, characters), rising action (conflict, complications), climax (twist, tone), falling action (growth, resolution), and denouement (closure).

**Characters**
Match based on arc type (positive, negative, flat, redemptive), role (e.g. protagonist, antagonist), motivation (e.g. love, protection), and flaws (e.g. fear, arrogance).

**Themes & Symbols**
Identify core ideas, emotional tone, and motifs (e.g. spinning top, red balloon). If a rare symbol or object is mentioned, treat it as a strong disambiguation cue and prioritize films known for that element.

**Genres**
For broad genres (e.g. thriller), suggest recent popular films. For niche or hybrid genres, prioritize fitting and unconventional examples.

**Similarity Matching**
Use Freytag’s Pyramid and character arcs. Favor Hero’s Journey for epic films, Dan Harmon’s Story Circle for animation/TV, and McKee’s Five Commandments for drama.

**If User Describes a Specific Film**
Infer the title using story elements, character arcs, themes, and rare motifs. Treat distinctive terms (e.g. “acid rain”) as high-weight indicators. Suggest likely matches even from cult or obscure films.

**Personalisation**
If a "User taste" section is provided, use it to choose between equally relevant films and to lean toward the user's preferred tone and story types — but the user's query always comes first. Never suggest a title the user is told to avoid.
When a suggestion is clearly connected to one of the user's highly rated films, set 'because_you_liked' to that exact film title and mention the connection in 'reason'. Otherwise set 'because_you_liked' to null.

**Suggestions**
- title: A descriptive, collection-friendly title that summarizes the query (e.g., "Horror Films Set in Forests" or "Survival Thrillers in Wilderness Settings").
- suggestions: 20 ranked films, each with the exact movie title, its 4-digit release year, why it matches, themes and tags.
`;

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "suggestions"],
  properties: {
    title: { type: "string" },
    suggestions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "year", "reason", "themes", "tags", "because_you_liked"],
        properties: {
          title: { type: "string" },
          year: { type: "string", description: "4-digit release year, e.g. 1999" },
          reason: { type: "string" },
          themes: { type: "array", items: { type: "string" } },
          tags: { type: "array", items: { type: "string" } },
          because_you_liked: { type: ["string", "null"] },
        },
      },
    },
  },
} as const;

function createTasteSection(taste: TasteProfile) {
  const loved = taste.anchors
    .filter((a) => !["Bad", "Awful"].includes(a.tier))
    .map((a) => `${a.title} (${a.year}) — ${a.tier}`);
  const disliked = taste.anchors
    .filter((a) => ["Bad", "Awful"].includes(a.tier))
    .map((a) => `${a.title} (${a.year})`);

  return `
    User taste:
    ${taste.summary}
    Likes: ${taste.likes.join(", ")}
    Dislikes: ${taste.dislikes.join(", ")}
    Highly rated films: ${loved.join("; ")}
    ${disliked.length ? `Rated poorly: ${disliked.join("; ")}` : ""}
  `;
}

function createPrompt({ query, excludeTitles, page, taste }: SuggestionRequest) {
  const excluded = excludeTitles.slice(0, MAX_EXCLUDED_TITLES);
  const exclusionNote: string = excluded.length
    ? `Avoid suggesting these titles (already shown or already watched): ${excluded.join(', ')}.`
    : '';

  return `
    User is looking for: "${query}"

    ${taste ? createTasteSection(taste) : ""}

    ${exclusionNote}

    Return exactly 20 new film suggestions ranked by relevance.
    These are page ${page} of suggestions — continue from where the last set left off.
  `;
}

/**
 * Map OpenAI SDK errors to user-friendly messages
 */
export function mapOpenAiError(error: unknown): Error {
  if (error && typeof error === "object" && ("status" in error || "code" in error)) {
    const { status, code, message = "Unknown error" } = error as {
      status?: number;
      code?: string;
      message?: string;
    };

    if (status === 429 || code === "rate_limit_exceeded") {
      return new Error("OpenAI rate limit exceeded. Please try again in a moment.");
    } else if (status === 401 || code === "invalid_api_key" || code === "authentication_error") {
      return new Error("OpenAI API key is invalid or expired. Please check your API key.");
    } else if (status === 500 || status === 502 || status === 503 || code === "server_error") {
      return new Error("OpenAI service is temporarily unavailable. Please try again later.");
    } else if (status === 400 || code === "invalid_request_error") {
      return new Error(`Invalid request to OpenAI: ${message}`);
    }
    return new Error(`OpenAI API error: ${message} (Status: ${status || "unknown"}, Code: ${code || "unknown"})`);
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("api key") || msg.includes("authentication")) {
      return new Error("OpenAI API key is invalid or expired. Please check your API key.");
    }
    return error;
  }

  return new Error(`Unknown error in OpenAI provider: ${String(error)}`);
}

export const OpenAiProvider: SuggestionProvider = {
  async *streamSuggestions(request: SuggestionRequest): AsyncIterable<ProviderEvent> {
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error("OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.");
    }

    if (!request.query || request.query.trim().length === 0) {
      throw new Error("Query cannot be empty");
    }

    const pending: ProviderEvent[] = [];
    const parser = createSuggestionStreamParser<MovieSuggestion>({
      onTitle: (title) => pending.push({ type: "title", title }),
      onItem: (suggestion) => {
        if (suggestion.title && /^\d{4}$/.test(suggestion.year)) {
          pending.push({ type: "suggestion", suggestion });
        }
      },
    });

    try {
      const stream = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: createPrompt(request) },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: "movie_suggestions", strict: true, schema: responseSchema },
        },
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (!delta) continue;
        parser.push(delta);
        while (pending.length) yield pending.shift()!;
      }
    } catch (error) {
      console.error("OpenAI Provider Error:", error);
      throw mapOpenAiError(error);
    }
  },
};
