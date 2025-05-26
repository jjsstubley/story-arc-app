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