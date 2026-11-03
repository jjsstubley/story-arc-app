/** A failure that retrying won't fix (e.g. TMDB has no such movie): fail the job now */
export class PermanentError extends Error {}
