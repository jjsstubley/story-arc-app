# Story Arc

Find, track and rate films and TV. Built with Remix 2 (Vite), Chakra UI v3, Supabase and TanStack Query.
Film data comes from TMDB; suggestions come from OpenAI or Gemini.

**Coding standards, architecture and domain rules are in [CLAUDE.md](CLAUDE.md).** Read it before
changing code. It's written for both developers and AI agents.

## Setup

Needs Node 20+ and, for the local database, Docker.

```sh
npm install
npx supabase start      # prints the local API URL and anon key
npm run dev
```

Create `.env.local` (it's gitignored) with:

| Variable | What it's for |
|---|---|
| `SUPABASE_URL`, `SUPABASE_KEY` | Supabase URL and anon key (server) |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY` | The same values, for the browser |
| `VITE_TMDB_ACCESS_TOKEN` | TMDB API read access token |
| `OPENAI_API_KEY` | AI suggestions |
| `GEMINI_KEY` | Only if using the Gemini provider |
| `VITE_APP_URL` | The app's own URL, e.g. `http://localhost:5173` |

To use the local database, set the Supabase variables to the values `npx supabase start` prints.

## Film story profiles

The `film-profile-worker` Edge Function builds each movie's story profile and embedding
(TMDB → Wikipedia plot → OpenAI). It drains `film_profile_jobs`, which fills itself when users rate,
favourite, watch or save a movie. `pg_cron` calls the worker every minute while there are jobs.

Create `supabase/functions/.env` (gitignored):

| Variable | What it's for |
|---|---|
| `OPENAI_API_KEY` | Profiles and embeddings |
| `TMDB_ACCESS_TOKEN` | TMDB API read access token |
| `FILM_WORKER_SECRET` | Any long random string (`openssl rand -hex 32`); cron sends it to the worker |
| `WIKIMEDIA_USER_AGENT` | Optional. Wikimedia asks for contact details, e.g. `filmarc/1.0 (you@example.com)` |

Locally:

```sh
npx supabase functions serve film-profile-worker --env-file supabase/functions/.env
```

Then tell cron where the worker is (once per database; `db reset` clears it):

```sql
select vault.create_secret('http://supabase_kong_story-arc-app:8000/functions/v1/film-profile-worker', 'film_worker_url');
select vault.create_secret('<FILM_WORKER_SECRET>', 'film_worker_secret');
```

In production, set the function's secrets with `npx supabase secrets set --env-file supabase/functions/.env`,
deploy with `npx supabase functions deploy film-profile-worker`, and create the same two Vault secrets
with `https://<project-ref>.supabase.co/functions/v1/film-profile-worker` as the URL.

To run the worker by hand: `curl -X POST -H "Authorization: Bearer $FILM_WORKER_SECRET" <url>`.
Failed jobs keep their error: `select * from film_profile_jobs where status = 'failed'`.

## Checks

```sh
npm run typecheck
npm run lint
npx supabase test db    # RLS tests; needs the local database running
```

## Production

```sh
npm run build
npm start
```

Deploy `build/server` and `build/client`.
