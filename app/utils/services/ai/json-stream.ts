/**
 * Incremental extractor for a streamed JSON object shaped like
 * `{ "title": "...", "suggestions": [ {...}, {...} ] }`.
 *
 * Feed it text chunks as they arrive; it calls `onTitle` once the top-level
 * title string is complete and `onItem` for each element of `suggestions`
 * as soon as its closing brace arrives.
 */
export function createSuggestionStreamParser<T>(handlers: {
  onTitle: (title: string) => void;
  onItem: (item: T) => void;
}) {
  let depth = 0;
  let inString = false;
  let escaped = false;
  let stringStart = -1;
  let lastKey: string | null = null;
  let inSuggestions = false;
  let itemStart = -1;
  let titleSent = false;
  let buffer = "";

  function push(chunk: string) {
    const offset = buffer.length;
    buffer += chunk;

    for (let i = offset; i < buffer.length; i++) {
      const ch = buffer[i];

      if (inString) {
        if (escaped) escaped = false;
        else if (ch === "\\") escaped = true;
        else if (ch === '"') {
          inString = false;
          // Strings at depth 1 are top-level keys or values
          if (depth === 1) {
            const value = JSON.parse(buffer.slice(stringStart, i + 1)) as string;
            if (lastKey === "title" && !titleSent) {
              titleSent = true;
              lastKey = null;
              handlers.onTitle(value);
            } else {
              lastKey = value;
            }
          }
        }
        continue;
      }

      if (ch === '"') {
        inString = true;
        stringStart = i;
      } else if (ch === "{" || ch === "[") {
        depth++;
        if (ch === "[" && depth === 2 && lastKey === "suggestions") inSuggestions = true;
        if (ch === "{" && depth === 3 && inSuggestions) itemStart = i;
      } else if (ch === "}" || ch === "]") {
        if (ch === "}" && depth === 3 && inSuggestions && itemStart >= 0) {
          handlers.onItem(JSON.parse(buffer.slice(itemStart, i + 1)) as T);
          itemStart = -1;
        }
        if (ch === "]" && depth === 2) inSuggestions = false;
        depth--;
      }
    }
  }

  return { push };
}
