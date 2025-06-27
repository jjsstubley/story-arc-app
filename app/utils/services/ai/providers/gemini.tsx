
// import OpenAI from "openai";
import { SuggestionProvider, SuggestionResult } from "../suggestionProvider";

// NEEDS TO BE REPLACED WITH ACTUAL GEMINI API CALLS

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const systemPrompt = `
// You are a film and TV recommendation expert. Help users find the most fitting titles based on story structure, character arcs, themes, tone, and symbolic elements.

// **Story Structure (Freytag’s Pyramid)**  
// Analyze exposition (setting, tone, characters), rising action (conflict, complications), climax (twist, tone), falling action (growth, resolution), and denouement (closure).

// **Characters**  
// Match based on arc type (positive, negative, flat, redemptive), role (e.g. protagonist, antagonist), motivation (e.g. love, protection), and flaws (e.g. fear, arrogance).

// **Themes & Symbols**  
// Identify core ideas, emotional tone, and motifs (e.g. spinning top, red balloon). If a rare symbol or object is mentioned, treat it as a strong disambiguation cue and prioritize films known for that element.

// **Genres**  
// For broad genres (e.g. thriller), suggest recent popular films. For niche or hybrid genres, prioritize fitting and unconventional examples.

// **Similarity Matching**  
// Use Freytag’s Pyramid and character arcs. Favor Hero’s Journey for epic films, Dan Harmon’s Story Circle for animation/TV, and McKee’s Five Commandments for drama.

// **If User Describes a Specific Film**  
// Infer the title using story elements, character arcs, themes, and rare motifs. Treat distinctive terms (e.g. “acid rain”) as high-weight indicators. Suggest likely matches even from cult or obscure films.

// **Suggestions**  
// Return a JSON object with:
// - title: 'Movies with' and a well understood summary of the query
// - 'suggestions': array of 20 ranked titles with:
//   - 'title', 'year', 'reason', 'themes' (optional), 'tags' (optional)
// `;

// function createPrompt(userQuery: string, previousTitles = [], page = 1) {
//   const exclusionNote: string = previousTitles.length
//     ? `Avoid suggesting these titles: ${previousTitles.join(', ')}.`
//     : '';

//   return `
//     User is looking for: "${userQuery}"
    
//     ${exclusionNote}
    
//     Return exactly 20 new film suggestions ranked by relevance as a JSON array.
//     These are page ${page} of suggestions — continue from where the last set left off.
//   `;
// }

export const GeminiProvider: SuggestionProvider = {
  async getSuggestions(query, previousTitles = [], page = 1): Promise<SuggestionResult> {
    // Construct and send Gemini prompt
    const response = await fetch("https://gemini-api", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.GEMINI_KEY}` },
      body: JSON.stringify({ query, previousTitles, page })
    });

    const json = await response.json();
    return json as SuggestionResult;
  },
};