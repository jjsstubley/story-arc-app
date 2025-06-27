import { TmdbMovieDetailInterface } from "~/interfaces/tdmi-movie-detail";

export function slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')  // remove punctuation
      .replace(/\s+/g, '-')          // replace spaces with -
      .replace(/-+/g, '-')           // collapse multiple dashes
      .trim();
}

export function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function parseCreditSlug(slugWithId: string): { nameSlug: string; id: number } | null {
    const match = slugWithId.match(/^([a-z0-9-]+)_(\d+)$/i);
  
    if (!match) return null;
  
    const [, nameSlug, idStr] = match;
    return {
      nameSlug,
      id: Number(idStr),
    };
}

export function getFormattedDate({release_date, options, region}: {release_date: string, options: Intl.DateTimeFormatOptions, region: string}) {
  const date = new Date(release_date);
  const formatted = new Intl.DateTimeFormat(region, options).format(date);

  return formatted
}

export function weightedRating(R: number, v: number, m: number = 1000, C: number= 6.8) {
  return (v / (v + m)) * R + (m / (v + m)) * C;
}

export function joinStringBy(arr: string[], separator: string = ', ') { 
  return arr.length > 0 ? arr.join(separator) : 'N/A';
}

type Tag = "Critically Acclaimed" | "Respected Gem" | "Hidden Gem" | "Cult Film" | "Underrated" | "Overrated" | "Breakout Indie" | "None";

export function getMovieTags(movie: TmdbMovieDetailInterface, options: {
  globalAverageRating: number; // C
  minimumVotes: number;        // m
}): Tag[] {
  const { vote_average: R, vote_count: v } = movie;
  const { globalAverageRating: C = 6.8, minimumVotes: m = 100} = options;
  const voteAvg = parseFloat(R)
  const voteCount = parseFloat(v)

  const WR = weightedRating(voteAvg, voteCount, m, C);
  const tags: Tag[] = [];

  // Known Gem
  if (voteAvg >= 8 && voteCount > 10000 && WR >= voteAvg - 0.3 && WR >= 7.8) {
    tags.push("Critically Acclaimed");
  }

  // Known Gem
  if (voteAvg >= 8 && voteCount > 5000 && voteCount <=10000 && WR >= voteAvg - 0.3 && WR >= 7.8) {
    tags.push("Respected Gem");
  }

  // Hidden Gem
  if (voteAvg >= 8 && voteCount >= 200 && voteCount <= 5000 && WR >= 7.0 && voteAvg - WR <= 1.0) {
    tags.push("Hidden Gem");
  }


  // Underrated
  if (WR - voteAvg >= 1.0 && WR >= 7.5 && voteAvg <= 6.5) {
    tags.push("Underrated");
  }

  // Overrated
  if (voteAvg >= 8.0 && WR <= 7.0 && voteAvg - WR >= 1.0 && voteCount >= 2000) {
    tags.push("Overrated");
  }

  return tags.length > 0 ? tags : [];
}