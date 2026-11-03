// The English Wikipedia plot section for a film, found through its Wikidata
// id so we never guess the article from the title. Used only as LLM input and
// never stored, so CC BY-SA attribution doesn't apply yet.

const MAX_PLOT_WORDS = 1500;
const PLOT_HEADING = /^==\s*(Plot|Plot summary|Synopsis|Summary|Story)\s*==\s*$/im;
const NEXT_TOP_HEADING = /^==[^=].*==\s*$/m;
// Wikimedia allows 200 requests a minute to clients whose User-Agent has
// contact details, but only 10 to anonymous ones, and asks for at most 3 at
// once. Requests from one run go one at a time, at most ~170 a minute.
// https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits
const MIN_REQUEST_GAP_MS = 350;
const MAX_RETRIES = 3;
const MAX_RETRY_WAIT_MS = 10_000;

/** Still rate-limited after retrying: the job should be retried later, not profiled without a plot */
export class WikipediaRateLimitedError extends Error {}

/** e.g. "filmarc/1.0 (https://filmarc.app; you@example.com)"; must include contact details in brackets */
const USER_AGENT = Deno.env.get("WIKIMEDIA_USER_AGENT")?.trim() ?? "";
const hasContactUserAgent = /\(.*(@|https?:\/\/).*\)/.test(USER_AGENT);
if (!hasContactUserAgent) {
  console.warn("WIKIMEDIA_USER_AGENT isn't set with contact details; profiles will use TMDB overviews only");
}

function headers() {
  return { "User-Agent": USER_AGENT };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let queue: Promise<unknown> = Promise.resolve();

/** fetch, serialised across the run and retried on 429/503 */
function wikiFetch(url: string): Promise<Response> {
  const request = queue.then(async () => {
    for (let attempt = 0; ; attempt++) {
      const response = await fetch(url, { headers: headers() });
      await sleep(MIN_REQUEST_GAP_MS);
      if (response.status !== 429 && response.status !== 503) return response;
      if (attempt >= MAX_RETRIES) throw new WikipediaRateLimitedError(`Wikimedia ${response.status} for ${url}`);
      const retryAfter = Number(response.headers.get("Retry-After")) * 1000;
      await sleep(Math.min(MAX_RETRY_WAIT_MS, retryAfter || 1000 * 2 ** attempt));
    }
  });
  queue = request.catch(() => undefined);
  return request;
}

async function getEnglishTitle(wikidataId: string): Promise<string | null> {
  // Only the enwiki sitelink: the full entity is megabytes for popular films,
  // and parsing it uses up the Edge Function's CPU limit
  const params = new URLSearchParams({
    action: "wbgetentities",
    ids: wikidataId,
    props: "sitelinks",
    sitefilter: "enwiki",
    format: "json",
  });
  const response = await wikiFetch(`https://www.wikidata.org/w/api.php?${params}`);
  if (!response.ok) {
    console.warn(`Wikidata ${response.status} for ${wikidataId}`);
    return null;
  }
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

/**
 * null when there's no Wikidata id, no English article or no plot section.
 * Throws WikipediaRateLimitedError when Wikimedia keeps refusing.
 */
export async function fetchPlot(wikidataId: string | null): Promise<{ title: string; plot: string } | null> {
  // Without contact details we'd be throttled to 10 requests a minute
  if (!wikidataId || !hasContactUserAgent) return null;
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
  const response = await wikiFetch(`https://en.wikipedia.org/w/api.php?${params}`);
  if (!response.ok) {
    console.warn(`Wikipedia ${response.status} for ${title}`);
    return null;
  }
  const data = await response.json();
  const extract: string | undefined = data.query?.pages?.[0]?.extract;
  const plot = extract ? extractPlotSection(extract) : null;
  return plot ? { title, plot } : null;
}
