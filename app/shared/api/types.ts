/**
 * Response envelope for every route built with `apiRoute`.
 * Success: `{ data }`. Failure: `{ error: { code, message } }` with a 4xx/5xx status.
 */
export interface ApiErrorBody {
  code: string;
  message: string;
}

export type ApiSuccess<T> = { data: T };
export type ApiFailure = { error: ApiErrorBody };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
