
import OpenAI from "openai";
import { SuggestionProvider } from "../suggestionProvider";

// In Remix server-side code, use process.env
const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: apiKey,
});

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

**Suggestions**  
Return a JSON object with:
- title: A descriptive, collection-friendly title that summarizes the query (e.g., "Horror Films Set in Forests" or "Survival Thrillers in Wilderness Settings"). Make it suitable for use as a collection name.
- 'suggestions': array of 20 ranked titles with:
  - 'title' (REQUIRED): The exact movie title
  - 'year' (REQUIRED): The release year as a 4-digit string (e.g., "2020", "1999"). This is MANDATORY for all suggestions.
  - 'reason' (REQUIRED): Why this movie matches the query
  - 'themes' (optional): Array of themes
  - 'tags' (optional): Array of tags

**IMPORTANT**: Every suggestion MUST include a 'year' field. If you cannot determine the year, use your best estimate based on the film's era, but always provide a year.
`;

function createPrompt(userQuery: string, previousTitles = [], page = 1) {
  const exclusionNote: string = previousTitles.length
    ? `Avoid suggesting these titles: ${previousTitles.join(', ')}.`
    : '';

  return `
    User is looking for: "${userQuery}"
    
    ${exclusionNote}
    
    Return exactly 20 new film suggestions ranked by relevance as a JSON array.
    These are page ${page} of suggestions — continue from where the last set left off.
  `;
}
export const OpenAiProvider: SuggestionProvider = {
    async getSuggestions(query: string) {
        try {
            // Validate API key
            if (!apiKey || apiKey.trim().length === 0) {
                throw new Error("OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.");
            }

            // Validate query
            if (!query || typeof query !== "string" || query.trim().length === 0) {
                throw new Error("Query cannot be empty");
            }

            console.log("=== OpenAI API Request ===");
            console.log("Query:", query);
            console.log("API Key present:", !!apiKey);
            console.log("API Key length:", apiKey?.length || 0);
            
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    {
                        role: "user",
                        content: createPrompt(query),
                    }
                ],
            });

            console.log("=== OpenAI API Response (Success) ===");
            console.log("Response status:", response);
            console.log("Response choices:", response.choices);
            console.log("First choice content:", response.choices?.[0]?.message?.content);

            // Validate response structure
            if (!response.choices || response.choices.length === 0) {
                throw new Error("No response from OpenAI API");
            }

            const messageContent = response.choices[0].message.content;
            if (!messageContent) {
                throw new Error("Empty response from OpenAI API");
            }

            // Clean and parse JSON
            const cleanJsonString = messageContent.replace(/^```json\s*|\s*```$/g, '');
            
            let parsed;
            try {
                parsed = JSON.parse(cleanJsonString);
            } catch (parseError) {
                console.error("JSON parse error:", parseError);
                console.error("Raw response:", cleanJsonString);
                throw new Error("Invalid JSON response from OpenAI API");
            }

            // Validate response structure
            if (!parsed || typeof parsed !== "object") {
                throw new Error("Invalid response format");
            }

            if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
                throw new Error("Response missing suggestions array");
            }

            // Validate that all suggestions have required fields
            const invalidSuggestions = parsed.suggestions.filter((s: { title?: string; year?: string }) => 
                !s.title || !s.year || typeof s.year !== "string"
            );
            
            if (invalidSuggestions.length > 0) {
                console.warn("Some suggestions missing required fields:", invalidSuggestions.length);
                // Filter out invalid suggestions rather than failing
                parsed.suggestions = parsed.suggestions.filter((s: { title?: string; year?: string }) => 
                    s.title && s.year && typeof s.year === "string"
                );
            }

            // Validate title exists and is a string
            if (!parsed.title || typeof parsed.title !== "string") {
                parsed.title = `Movies: ${query}`;
            }

            return parsed;
        } catch (error: unknown) {
            // Log the raw error for debugging
            console.error("OpenAI Provider Raw Error:", {
                error,
                errorType: error?.constructor?.name,
                errorString: String(error),
                hasStatus: error && typeof error === "object" && "status" in error,
                hasCode: error && typeof error === "object" && "code" in error,
            });
            
            // Handle OpenAI SDK errors (v4+ uses APIError class)
            // Check if it's an OpenAI APIError instance
            if (error && typeof error === "object") {
                // Check for OpenAI SDK error structure
                const hasStatus = "status" in error;
                const hasCode = "code" in error;
                
                if (hasStatus || hasCode) {
                    const apiError = error as { 
                        status?: number; 
                        code?: string; 
                        message?: string;
                        type?: string;
                    };
                    
                    const status = apiError.status;
                    const code = apiError.code;
                    const message = apiError.message || "Unknown error";
                    
                    // Handle specific status codes
                    if (status === 429 || code === "rate_limit_exceeded") {
                        throw new Error("OpenAI rate limit exceeded. Please try again in a moment.");
                    } else if (status === 401 || code === "invalid_api_key" || code === "authentication_error") {
                        throw new Error("OpenAI API key is invalid or expired. Please check your API key.");
                    } else if (status === 500 || status === 502 || status === 503 || code === "server_error") {
                        throw new Error("OpenAI service is temporarily unavailable. Please try again later.");
                    } else if (status === 400 || code === "invalid_request_error") {
                        throw new Error(`Invalid request to OpenAI: ${message}`);
                    } else {
                        throw new Error(`OpenAI API error: ${message} (Status: ${status || "unknown"}, Code: ${code || "unknown"})`);
                    }
                }
            }
            
            // Handle standard Error instances
            if (error instanceof Error) {
                // Check error message for common patterns
                const msg = error.message.toLowerCase();
                if (msg.includes("api key") || msg.includes("authentication")) {
                    throw new Error("OpenAI API key is invalid or expired. Please check your API key.");
                }
                // Re-throw Error instances as-is
                throw error;
            }
            
            // Unknown error type
            throw new Error(`Unknown error in OpenAI provider: ${String(error)}`);
        }
    }
}