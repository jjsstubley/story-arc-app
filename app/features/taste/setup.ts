export const SETUP_PATH = "/profile/taste/setup";

/** The setup page, returning to `next` when finished or put off */
export function setupPath(next = "/"): string {
  return `${SETUP_PATH}?${new URLSearchParams({ next })}`;
}
