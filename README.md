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
