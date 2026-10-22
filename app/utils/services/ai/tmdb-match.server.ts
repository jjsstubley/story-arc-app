import { getBestMovieMatch, getMovieBySearchQuery } from "~/utils/services/external/tmdb/search";

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
export async function findMovieIdFromTitleAndYear(title: string, year?: string): Promise<number | null> {
  if (!title) return null;

  try {
    // Strategy 1: Exact title + year match using getBestMovieMatch
    if (year) {
      try {
        const bestMatch = await getBestMovieMatch({ title, year });
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

    // Strategy 5: Search without year as last resort
    // (No TV fallback: TV and movie IDs are separate namespaces, so a TV ID
    // would be looked up as an unrelated movie.)
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
