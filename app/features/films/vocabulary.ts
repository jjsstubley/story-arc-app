// The story vocabulary lives with the Edge Functions so the film-profile-worker
// can import it too (Deno can't import from app/). Client and server safe.
export * from "../../../supabase/functions/_shared/film-vocabulary";
