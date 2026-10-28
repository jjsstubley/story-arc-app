/** The taste page: profile, preferences and "For you" lists */
export const TASTE_PATH = "/profile/taste";
export const SETUP_PATH = "/profile/taste/setup";

/** The setup page, returning to `next` when finished or put off */
export function setupPath(next = "/"): string {
  return `${SETUP_PATH}?${new URLSearchParams({ next })}`;
}
