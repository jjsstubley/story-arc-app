import { SuggestionProvider } from "./suggestionProvider";
import { OpenAiProvider } from "./providers/openai";
// import { GeminiProvider } from "~/ai/providers/gemini";
import { getMovieBySearchQuery, getBestMovieMatch } from "~/utils/services/external/tmdb/search";
import { getMovieDetailsById } from "~/utils/services/external/tmdb/movies";
import { json } from "@remix-run/node";
import type { SupabaseClient } from "@supabase/supabase-js";
import { findSimilarQuery, getRecommendationsByQueryId, saveAiQueryAndRecommendations } from "~/utils/services/supabase/ai-recommendations.server";
import { createCollectionWithItems } from "~/utils/services/supabase/collections.server";

// const provider: SuggestionProvider =
//   process.env.AI_PROVIDER === "gemini"
//     ? GeminiSuggestionProvider
//     : OpenAiProvider;

const provider: SuggestionProvider = OpenAiProvider

/**
 * Helper function to normalize title for matching
 * Removes common prefixes and normalizes whitespace
 */
function normalizeTitle(title: string): string {
  return title
    .trim()
    .replace(/^(the|a|an)\s+/i, '') // Remove "The", "A", "An" prefix
    .toLowerCase()
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Calculate similarity score between two titles (simple Levenshtein-like)
 */
function titleSimilarity(title1: string, title2: string): number {
  const norm1 = normalizeTitle(title1);
  const norm2 = normalizeTitle(title2);
  
  if (norm1 === norm2) return 1.0;
  
  // Check if one contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    return 0.8;
  }
  
  // Simple character overlap
  const chars1 = new Set(norm1.split(''));
  const chars2 = new Set(norm2.split(''));
  const intersection = new Set([...chars1].filter(c => chars2.has(c)));
  const union = new Set([...chars1, ...chars2]);
  
  return intersection.size / union.size;
}

/**
 * Enhanced function to find movie_id from title and year
 * Uses multiple matching strategies with fallbacks
 */
async function findMovieIdFromTitleAndYear(title: string, year?: string): Promise<number | null> {
  if (!title) return null;

  try {
    // Strategy 1: Exact title + year match using getBestMovieMatch
    if (year) {
      try {
        const bestMatch = await getBestMovieMatch({ title, year });
        console.log("=== Best Match ===");
        console.log("Best Match:", bestMatch);
        if (bestMatch && !bestMatch.error && bestMatch.id) {
          return bestMatch.id;
        }
      } catch (error) {
        console.warn(`getBestMovieMatch failed for "${title}" (${year}):`, error);
      }
    }

    // Strategy 2: Search movies with title + year
    try {
      const searchResults = await getMovieBySearchQuery({ title, year });
      console.log("=== Search Results ===");
      console.log("Search Results:", searchResults);
      if (searchResults?.results && searchResults.results.length > 0) {
        // Try exact match first
        if (year) {
          const exactMatch = searchResults.results.find(
            (m: { title: string; release_date?: string }) => {
              const normalizedTitle = normalizeTitle(m.title);
              const normalizedSearch = normalizeTitle(title);
              return normalizedTitle === normalizedSearch && 
                     m.release_date?.startsWith(year);
            }
          );
          if (exactMatch?.id) {
            return exactMatch.id;
          }

          // Try fuzzy match with year
          const fuzzyMatches = searchResults.results
            .filter((m: { title: string; release_date?: string }) => 
              m.release_date?.startsWith(year)
            )
            .map((m: { title: string; id: number }) => ({
              ...m,
              similarity: titleSimilarity(m.title, title)
            }))
            .sort((a: { similarity: number }, b: { similarity: number }) => b.similarity - a.similarity);

          if (fuzzyMatches.length > 0 && fuzzyMatches[0].similarity > 0.6) {
            return fuzzyMatches[0].id;
          }
        }

        // Strategy 3: Title-only match (if year unavailable or no year match)
        const titleOnlyMatches = searchResults.results
          .map((m: { title: string; id: number }) => ({
            ...m,
            similarity: titleSimilarity(m.title, title)
          }))
          .sort((a: { similarity: number }, b: { similarity: number }) => b.similarity - a.similarity);

        if (titleOnlyMatches.length > 0 && titleOnlyMatches[0].similarity > 0.7) {
          return titleOnlyMatches[0].id;
        }

        // Strategy 4: Fallback to first result if similarity is reasonable
        if (titleOnlyMatches.length > 0 && titleOnlyMatches[0].similarity > 0.5) {
          return titleOnlyMatches[0].id;
        }
      }
    } catch (error) {
      console.warn(`Movie search failed for "${title}":`, error);
    }

    // Strategy 5: Try TV search as fallback (some movies might be listed as TV)
    if (year) {
      try {
        const { getTVBySearchQuery } = await import("~/utils/services/external/tmdb/search");
        const tvResults = await getTVBySearchQuery({ title, year });
        if (tvResults?.results && tvResults.results.length > 0) {
          const exactTVMatch = tvResults.results.find(
            (m: { name: string; first_air_date?: string }) => {
              const normalizedTitle = normalizeTitle(m.name);
              const normalizedSearch = normalizeTitle(title);
              return normalizedTitle === normalizedSearch && 
                     m.first_air_date?.startsWith(year);
            }
          );
          if (exactTVMatch?.id) {
            // Note: TV shows have different ID structure, but we'll return it
            // The caller should handle this appropriately
            return exactTVMatch.id;
          }
        }
      } catch (error) {
        console.warn(`TV search failed for "${title}":`, error);
      }
    }

    // Strategy 6: Search without year as last resort
    try {
      const searchResultsNoYear = await getMovieBySearchQuery({ title });
      if (searchResultsNoYear?.results && searchResultsNoYear.results.length > 0) {
        const bestMatch = searchResultsNoYear.results
          .map((m: { title: string; id: number }) => ({
            ...m,
            similarity: titleSimilarity(m.title, title)
          }))
          .sort((a: { similarity: number }, b: { similarity: number }) => b.similarity - a.similarity)[0];

        if (bestMatch && bestMatch.similarity > 0.6) {
          return bestMatch.id;
        }
      }
    } catch (error) {
      console.warn(`Title-only search failed for "${title}":`, error);
    }

  } catch (error) {
    console.error(`Failed to find movie_id for "${title}" (${year}):`, error);
  }

  return null;
}

export async function getSuggestions(query: string, userId?: string, supabase?: SupabaseClient, context?: object) {
  try {
    // Validate query input
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      throw new Error("Query cannot be empty");
    }

    // Check for cached query if user is authenticated
    if (userId && supabase) {
      let similarQuery;
      try {
        similarQuery = await findSimilarQuery(query, userId, supabase);
      } catch (dbError) {
        console.error("Error searching for similar query:", dbError);
        // Continue to OpenAI call if cache lookup fails
      }
      
      if (similarQuery) {
        // Found a similar query, get cached recommendations
        let cachedRecommendations = [];
        try {
          cachedRecommendations = await getRecommendationsByQueryId(similarQuery.id, userId, supabase);
        } catch (dbError) {
          console.error("Error fetching cached recommendations:", dbError);
          // Continue to OpenAI call if cache fetch fails
        }
        
        if (cachedRecommendations.length > 0) {
          // Enrich cached recommendations with TMDB data
          const enriched = {
            title: `Movies similar to "${similarQuery.prompt}"`,
            suggestions: await Promise.all(
              cachedRecommendations.map(async (rec) => {
                try {
                  const movieDetails = await getMovieDetailsById({
                    movie_id: rec.movie_id,
                  });

                  // context_tags is now a simple string array (combined themes and tags)
                  const contextTags = Array.isArray(rec.context_tags) ? rec.context_tags : [];
                  
                  return {
                    title: movieDetails?.title || `Movie ${rec.movie_id}`,
                    year: movieDetails?.release_date?.split('-')[0] || '',
                    reason: rec.reasoning || '',
                    themes: [], // Themes and tags are now combined in context_tags array
                    tags: contextTags, // All tags (themes + tags) are in the tags array
                    tmdbData: movieDetails || null,
                  };
                } catch (error) {
                  console.error(`Failed to fetch movie ${rec.movie_id}:`, error);
                  const contextTags = Array.isArray(rec.context_tags) ? rec.context_tags : [];
                  
                  return {
                    title: `Movie ${rec.movie_id}`,
                    year: '',
                    reason: rec.reasoning || '',
                    themes: [], // Themes and tags are now combined in context_tags array
                    tags: contextTags, // All tags (themes + tags) are in the tags array
                    tmdbData: null,
                  };
                }
              })
            ),
          };

          return json({ result: enriched, cached: true });
        }
      }
    }

    // No cached query found, call OpenAI
    const rawData = await provider.getSuggestions(query);

    console.log('getSuggestions rawData', rawData)

    // Enrich with TMDB data using enhanced matching
    const matchingStats = {
      total: rawData.suggestions.length,
      matched: 0,
      failed: 0,
      failedTitles: [] as string[],
    };

    const enrichedSuggestions = await Promise.all(
      rawData.suggestions.map(async (movie: {title: string, year: string, reason?: string, themes?: string[], tags?: string[]}) => {
        // Use enhanced matching function which tries multiple strategies
        let movieId: number | null = null;
        let bestMatch = null;

        try {
          // Use the enhanced matching function
          movieId = await findMovieIdFromTitleAndYear(movie.title, movie.year);
          
          if (movieId) {
            // Get full movie details if we found a match
            try {
              bestMatch = await getMovieDetailsById({ movie_id: movieId });
              matchingStats.matched++;
            } catch (error) {
              console.error(`Failed to get movie details for ID ${movieId}:`, error);
              // Keep the movieId even if details fetch fails
              matchingStats.matched++;
            }
          } else {
            matchingStats.failed++;
            matchingStats.failedTitles.push(`${movie.title} (${movie.year || 'no year'})`);
            console.warn(`Could not find TMDB match for: "${movie.title}" (${movie.year || 'no year'})`);
          }
        } catch (error) {
          console.error(`Error enriching movie "${movie.title}":`, error);
          matchingStats.failed++;
          matchingStats.failedTitles.push(`${movie.title} (${movie.year || 'no year'})`);
        }

        return { 
          ...movie, 
          tmdbData: bestMatch,
          movie_id: movieId,
        };
      })
    );

    // Log matching statistics
    console.log("=== Movie Matching Statistics ===");
    console.log(`Total suggestions: ${matchingStats.total}`);
    console.log(`Successfully matched: ${matchingStats.matched} (${((matchingStats.matched / matchingStats.total) * 100).toFixed(1)}%)`);
    console.log(`Failed to match: ${matchingStats.failed} (${((matchingStats.failed / matchingStats.total) * 100).toFixed(1)}%)`);
    if (matchingStats.failedTitles.length > 0) {
      console.log("Failed titles:", matchingStats.failedTitles);
    }

    const enriched = {
      title: rawData.title,
      suggestions: enrichedSuggestions,
    };

    // Save to database if user is authenticated
    if (userId && supabase) {
      try {
        // Filter to only suggestions with valid movie_id
        const recommendationsToSave = enrichedSuggestions
          .filter((s: { movie_id: number | null }) => s.movie_id) // Only save if we have a valid movie_id
          .map((s: { movie_id: number | null; themes?: string[]; tags?: string[]; reason?: string }) => {
            // Combine themes and tags into a simple string array
            const allTags = [
              ...(s.themes || []),
              ...(s.tags || [])
            ];
            
            return {
              movie_id: s.movie_id!,
              context_tags: allTags.length > 0 ? allTags : null,
              reasoning: s.reason || null,
            };
          });

        console.log(`=== Saving to Database ===`);
        console.log(`Recommendations to save: ${recommendationsToSave.length} out of ${enrichedSuggestions.length}`);

        // Save even if only some movies matched (don't require 100% match rate)
        if (recommendationsToSave.length > 0) {
          try {
            const aiQuery = await saveAiQueryAndRecommendations(
              query,
              context || null,
              recommendationsToSave,
              userId,
              supabase
            );
            console.log(`AI query saved with ID: ${aiQuery.id}`);
            console.log(`Saved ${recommendationsToSave.length} recommendations`);

            // Automatically create a collection from these recommendations
            let movieIds: number[] = [];
            try {
              console.log("=== Starting Collection Creation ===");
              console.log("User ID:", userId);
              console.log("AI Query ID:", aiQuery.id);
              console.log("Total enriched suggestions:", enrichedSuggestions.length);
              
              // Collect all unique tags from suggestions
              const allTags = enrichedSuggestions
                .flatMap((s: { tags?: string[] }) => s.tags || [])
                .filter((tag: string, index: number, self: string[]) => self.indexOf(tag) === index); // unique tags

              console.log("All tags collected:", allTags);
              console.log("Number of unique tags:", allTags.length);

              // Get all movie IDs that were successfully matched
              movieIds = enrichedSuggestions
                .filter((s: { movie_id: number | null }) => s.movie_id)
                .map((s: { movie_id: number | null }) => s.movie_id!);

              console.log("Movie IDs for collection:", movieIds);
              console.log("Number of movie IDs:", movieIds.length);
              
              // Log which suggestions have movie_id and which don't
              const suggestionsWithMovieId = enrichedSuggestions.filter((s: { movie_id: number | null }) => s.movie_id);
              const suggestionsWithoutMovieId = enrichedSuggestions.filter((s: { movie_id: number | null }) => !s.movie_id);
              console.log(`Suggestions with movie_id: ${suggestionsWithMovieId.length}`);
              console.log(`Suggestions without movie_id: ${suggestionsWithoutMovieId.length}`);
              
              if (suggestionsWithoutMovieId.length > 0) {
                console.warn("Suggestions that failed to match with TMDB:", 
                  suggestionsWithoutMovieId.map((s: { title?: string; year?: string }) => 
                    `${s.title} (${s.year || 'no year'})`
                  )
                );
              }

              if (movieIds.length > 0) {
                // Use the title from OpenAI response, or generate a fallback
                const collectionTitle = rawData.title && rawData.title.trim() 
                  ? rawData.title.trim()
                  : `AI Recommendations: ${query}`;

                console.log(`=== Creating Collection ===`);
                console.log(`Collection title: "${collectionTitle}"`);
                console.log(`Number of movies: ${movieIds.length}`);
                console.log("Collection data:", {
                  name: collectionTitle,
                  description: `AI-generated recommendations based on: "${query}"`,
                  tags: allTags,
                  generated_from: {
                    type: 'ai_recommendation',
                    query: query,
                    ai_query_id: aiQuery.id,
                    context: context || null
                  },
                  is_public: false,
                  is_system_generated: true
                });
                
                console.log("Calling createCollectionWithItems...");
                const collection = await createCollectionWithItems(
                  userId,
                  {
                    name: collectionTitle,
                    description: `AI-generated recommendations based on: "${query}"`,
                    tags: allTags,
                    generated_from: {
                      type: 'ai_recommendation',
                      query: query,
                      ai_query_id: aiQuery.id,
                      context: context || null
                    },
                    is_public: false,
                    is_system_generated: true
                  },
                  movieIds,
                  supabase
                );
                console.log(`=== Collection Created Successfully ===`);
                console.log(`Collection ID: ${collection.id}`);
                console.log(`Collection name: ${collection.name}`);
                console.log(`Collection created at: ${collection.created_at}`);
              } else {
                console.warn("=== No Movie IDs Available ===");
                console.warn("Cannot create collection - no movie IDs to add");
                console.warn("This means all movies failed to match with TMDB");
                console.warn("Enriched suggestions breakdown:", 
                  enrichedSuggestions.map((s: { title?: string; year?: string; movie_id: number | null }) => ({ 
                    title: s.title, 
                    year: s.year,
                    movie_id: s.movie_id,
                    has_movie_id: !!s.movie_id
                  }))
                );
              }
            } catch (collectionError) {
              // Log error but don't fail the request if collection creation fails
              console.error("=== Collection Creation Error ===");
              console.error("Failed to create collection from AI recommendations");
              console.error("Error:", collectionError);
              console.error("Error details:", {
                message: collectionError instanceof Error ? collectionError.message : String(collectionError),
                stack: collectionError instanceof Error ? collectionError.stack : undefined,
                name: collectionError instanceof Error ? collectionError.name : undefined,
                userId: userId,
                aiQueryId: aiQuery?.id,
                movieIdsCount: movieIds.length,
              });
              
              // If it's a Supabase error, log additional details
              if (collectionError && typeof collectionError === "object" && "code" in collectionError) {
                const supabaseError = collectionError as { code?: string; message?: string; details?: string; hint?: string };
                console.error("Supabase error code:", supabaseError.code);
                console.error("Supabase error message:", supabaseError.message);
                console.error("Supabase error details:", supabaseError.details);
                console.error("Supabase error hint:", supabaseError.hint);
              }
            }
          } catch (saveError) {
            console.error('Failed to save AI query and recommendations:', saveError);
            throw saveError; // Re-throw to be caught by outer catch
          }
        } else {
          console.warn("No recommendations to save - all movies failed to match with TMDB");
          console.warn("This may indicate an issue with movie matching or TMDB API");
        }
      } catch (saveError) {
        // Log error but don't fail the request
        console.error('Failed to save AI query and recommendations:', saveError);
      }
    }

    return json({ result: enriched, cached: false });
  } catch (error) {
    // Log detailed error information
    console.error("=== AI Service Error ===");
    console.error("Error:", error);
    console.error("Error type:", typeof error);
    console.error("Error constructor:", error?.constructor?.name);
        
    // Log detailed error information
    const errorDetails = {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      query,
      userId,
      timestamp: new Date().toISOString(),
      errorType: error?.constructor?.name,
      errorString: String(error),
    };
    
    console.error("AI Suggestions Error:", errorDetails);
    console.error("Full error object:", error);

    // Provide user-friendly error messages
    let errorMessage = "Failed to fetch AI suggestions";
    
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      
      // Check for specific error patterns (more specific checks first)
      if (msg.includes("api key is not configured") || msg.includes("api key is invalid")) {
        errorMessage = "OpenAI API key is not configured or invalid. Please check your environment variables.";
      } else if (msg.includes("rate limit exceeded") || (msg.includes("429") && msg.includes("rate"))) {
        errorMessage = "Too many requests. Please try again in a moment.";
      } else if (msg.includes("openai rate limit")) {
        errorMessage = "Too many requests. Please try again in a moment.";
      } else if (msg.includes("service is temporarily unavailable") || msg.includes("503") || msg.includes("502")) {
        errorMessage = "AI service is temporarily unavailable. Please try again later.";
      } else if (msg.includes("network") || msg.includes("fetch") || msg.includes("econnrefused")) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (msg.includes("json") || msg.includes("parse") || msg.includes("invalid json")) {
        errorMessage = "Received invalid response from AI service. Please try again.";
      } else if (msg.includes("401") || msg.includes("unauthorized") || msg.includes("invalid or expired")) {
        errorMessage = "Authentication failed. Please check your API key configuration.";
      } else if (msg.includes("query cannot be empty")) {
        errorMessage = "Please enter a search query.";
      } else {
        // Use the error message if it's user-friendly and not too long
        if (error.message.length < 150 && !error.message.includes("stack")) {
          errorMessage = error.message;
        }
      }
    }

    return json({ error: errorMessage }, { status: 500 });
  }
}