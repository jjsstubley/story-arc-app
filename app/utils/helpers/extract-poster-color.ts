import ColorThief from 'colorthief';
import { getGradientColor } from './gradient-colors';

/**
 * Chakra UI color palette with RGB values for color matching
 */
const CHAKRA_COLORS = [
  { name: "orange.900", rgb: [194, 65, 12] },
  { name: "orange.800", rgb: [234, 88, 12] },
  { name: "orange.700", rgb: [251, 146, 60] },
  { name: "blue.900", rgb: [30, 58, 138] },
  { name: "blue.800", rgb: [30, 64, 175] },
  { name: "blue.700", rgb: [29, 78, 216] },
  { name: "purple.900", rgb: [88, 28, 135] },
  { name: "purple.800", rgb: [107, 33, 168] },
  { name: "purple.700", rgb: [126, 34, 206] },
  { name: "pink.900", rgb: [131, 24, 67] },
  { name: "pink.800", rgb: [157, 23, 77] },
  { name: "pink.700", rgb: [190, 24, 93] },
  { name: "teal.900", rgb: [19, 78, 74] },
  { name: "teal.800", rgb: [17, 94, 89] },
  { name: "teal.700", rgb: [15, 118, 110] },
  { name: "cyan.900", rgb: [22, 78, 99] },
  { name: "cyan.800", rgb: [21, 94, 117] },
  { name: "cyan.700", rgb: [14, 116, 144] },
  { name: "red.900", rgb: [127, 29, 29] },
  { name: "red.800", rgb: [153, 27, 27] },
  { name: "red.700", rgb: [185, 28, 28] },
  { name: "green.900", rgb: [20, 83, 45] },
  { name: "green.800", rgb: [22, 101, 52] },
  { name: "green.700", rgb: [20, 128, 61] },
  { name: "yellow.900", rgb: [113, 63, 18] },
  { name: "yellow.800", rgb: [133, 77, 14] },
  { name: "yellow.700", rgb: [161, 98, 7] },
  { name: "indigo.900", rgb: [49, 46, 129] },
  { name: "indigo.800", rgb: [55, 48, 163] },
  { name: "indigo.700", rgb: [67, 56, 202] },
] as const;

/**
 * Calculate Euclidean distance between two RGB colors
 */
function colorDistance(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  return Math.sqrt(
    Math.pow(rgb1[0] - rgb2[0], 2) +
    Math.pow(rgb1[1] - rgb2[1], 2) +
    Math.pow(rgb1[2] - rgb2[2], 2)
  );
}

/**
 * Map RGB color to nearest Chakra UI color token
 */
export function rgbToChakraColor(r: number, g: number, b: number): string {
  const targetRgb: [number, number, number] = [r, g, b];
  
  let minDistance = Infinity;
  let closestColor = "orange.900"; // Default fallback
  
  CHAKRA_COLORS.forEach(({ name, rgb }) => {
    const distance = colorDistance(targetRgb, rgb as [number, number, number]);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = name;
    }
  });
  
  return closestColor;
}

/**
 * Extract dominant color from poster image
 */
export async function extractPosterColor(posterPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = `https://image.tmdb.org/t/p/w300/${posterPath}`;
    
    img.onload = () => {
      try {
        const colorThief = new ColorThief();
        const [r, g, b] = colorThief.getColor(img);
        const chakraColor = rgbToChakraColor(r, g, b);
        resolve(chakraColor);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
}

/**
 * Cache key format for localStorage
 */
function getCacheKey(movieId: string | number): string {
  return `poster-color-${movieId}`;
}

/**
 * Get cached color from localStorage
 */
export function getCachedColor(movieId: string | number): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(getCacheKey(movieId));
    if (cached) {
      return cached;
    }
  } catch (error) {
    // localStorage may be unavailable (private browsing, quota exceeded)
    console.warn('Failed to read from localStorage:', error);
  }
  
  return null;
}

/**
 * Cache color in localStorage
 */
export function cacheColor(movieId: string | number, color: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(getCacheKey(movieId), color);
  } catch (error) {
    // localStorage may be unavailable (private browsing, quota exceeded)
    console.warn('Failed to write to localStorage:', error);
  }
}

/**
 * Extract color from poster with caching and fallback
 */
export async function getPosterGradientColor(
  movieId: string | number,
  posterPath: string | null | undefined,
  fallbackId?: string
): Promise<string> {
  // If no poster path, use fallback
  if (!posterPath) {
    return fallbackId ? getGradientColor(fallbackId) : 'orange.900';
  }
  
  // Check cache first
  const cached = getCachedColor(movieId);
  if (cached) {
    return cached;
  }
  
  // Extract color from image
  try {
    const color = await extractPosterColor(posterPath);
    cacheColor(movieId, color);
    return color;
  } catch (error) {
    // CORS error, image load failure, or extraction error
    console.warn('Failed to extract poster color:', error);
    // Fallback to hash-based color
    return fallbackId ? getGradientColor(fallbackId) : 'orange.900';
  }
}

