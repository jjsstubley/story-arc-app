import { useState, useEffect, useMemo } from 'react';
import { getPosterGradientColor } from '~/utils/helpers/extract-poster-color';
import { getGradientColor } from '~/utils/helpers/gradient-colors';

/**
 * React hook to extract gradient color from poster image
 * Returns extracted color or fallback to hash-based color
 */
export function usePosterGradientColor(
  movieId: string | number | undefined,
  posterPath: string | null | undefined,
  fallbackId?: string
): string {
  const [color, setColor] = useState<string>(() => {
    // Initial fallback color
    if (fallbackId) {
      return getGradientColor(fallbackId);
    }
    return 'orange.900';
  });

  const memoizedMovieId = useMemo(() => movieId, [movieId]);
  const memoizedPosterPath = useMemo(() => posterPath, [posterPath]);

  useEffect(() => {
    // If no movie ID or poster path, use fallback
    if (!memoizedMovieId || !memoizedPosterPath) {
      const fallback = fallbackId ? getGradientColor(fallbackId) : 'orange.900';
      setColor(fallback);
      return;
    }

    // Extract color (will use cache if available)
    getPosterGradientColor(memoizedMovieId, memoizedPosterPath, fallbackId)
      .then((extractedColor) => {
        setColor(extractedColor);
      })
      .catch(() => {
        // If extraction fails, use fallback
        const fallback = fallbackId ? getGradientColor(fallbackId) : 'orange.900';
        setColor(fallback);
      });
  }, [memoizedMovieId, memoizedPosterPath, fallbackId]);

  return color;
}

