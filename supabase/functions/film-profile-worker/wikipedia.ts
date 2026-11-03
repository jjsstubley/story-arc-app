// The English Wikipedia plot section for a film, found through its Wikidata
// id so we never guess the article from the title. Used only as LLM input and
// never stored, so CC BY-SA attribution doesn't apply yet.

const MAX_PLOT_WORDS = 1500;
const PLOT_HEADING = /^==\s*(Plot|Plot summary|Synopsis|Summary|Story)\s*==\s*$/im;
const NEXT_TOP_HEADING = /^==[^=].*==\s*$/m;

// Wikimedia asks API clients to identify themselves
function headers() {
  return { "User-Agent": Deno.env.get("WIKIMEDIA_USER_AGENT") ?? "filmarc-story-profiles/1.0" };
}

async function getEnglishTitle(wikidataId: string): Promise<string | null> {
  const response = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`, { headers: headers() });
  if (!response.ok) return null;
  const data = await response.json();
  return data.entities?.[wikidataId]?.sitelinks?.enwiki?.title ?? null;
}

export function extractPlotSection(articleText: string): string | null {
  const heading = PLOT_HEADING.exec(articleText);
  if (!heading) return null;
  const rest = articleText.slice(heading.index + heading[0].length);
  const end = NEXT_TOP_HEADING.exec(rest);
  const plot = (end ? rest.slice(0, end.index) : rest).replace(/^=+.*=+\s*$/gm, "").trim();
  if (!plot) return null;
  const words = plot.split(/\s+/);
  return words.length > MAX_PLOT_WORDS ? `${words.slice(0, MAX_PLOT_WORDS).join(" ")} …` : plot;
}

/** null when there's no Wikidata id, no English article or no plot section */
export async function fetchPlot(wikidataId: string | null): Promise<{ title: string; plot: string } | null> {
  if (!wikidataId) return null;
  const title = await getEnglishTitle(wikidataId);
  if (!title) return null;

  const params = new URLSearchParams({
    action: "query",
    prop: "extracts",
    explaintext: "1",
    redirects: "1",
    format: "json",
    formatversion: "2",
    titles: title,
  });
  const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, { headers: headers() });
  if (!response.ok) return null;
  const data = await response.json();
  const extract: string | undefined = data.query?.pages?.[0]?.extract;
  const plot = extract ? extractPlotSection(extract) : null;
  return plot ? { title, plot } : null;
}
