/**
 * Typed application errors, shared by server and client.
 *
 * Server code throws these; `apiRoute` maps them to an HTTP status and the
 * `{ error: { code, message } }` envelope. On the client, `apiFetch` turns
 * that envelope back into an AppError so React Query sees a real error.
 *
 * Messages on 4xx errors are shown to users, so write them for users.
 */
export class AppError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, { code = "INTERNAL", status = 500 }: { code?: string; status?: number } = {}) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }

  /** True for errors whose message is safe and useful to show the user */
  get isUserFacing(): boolean {
    return this.status === 0 || (this.status >= 400 && this.status < 500);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code = "VALIDATION") {
    super(message, { code, status: 400 });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Please sign in to continue.") {
    super(message, { code: "UNAUTHORIZED", status: 401 });
  }
}

export class NotFoundError extends AppError {
  constructor(message = "We couldn't find what you were looking for.", code = "NOT_FOUND") {
    super(message, { code, status: 404 });
  }
}

/** The request is valid but conflicts with current state (e.g. rating an unwatched movie) */
export class ConflictError extends AppError {
  constructor(message: string, code = "CONFLICT") {
    super(message, { code, status: 409 });
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/** A message that is safe to show the user, falling back for unexpected errors */
export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  return isAppError(error) && error.isUserFacing ? error.message : fallback;
}
