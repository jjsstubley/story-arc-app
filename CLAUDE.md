# Story Arc (filmarc)

Remix 2 (Vite) + Chakra UI v3 + Supabase + TanStack Query. TMDB for film data, OpenAI/Gemini for suggestions.

```
npm run dev        # dev server
npm run typecheck  # tsc (the repo has ~44 known pre-existing errors; don't add new ones)
npm run lint
npm run build

npx supabase start                    # local Supabase (needs Docker)
npx supabase test db                  # pgTAP tests in supabase/tests/
npx supabase db reset                 # rebuild the local DB from migrations
npx supabase migration new <name>     # new migration file
```

## Architecture (migration in progress)

The app is moving from type-based folders (`components/`, `utils/services/`, `interfaces/`) to feature slices.
**`app/features/ratings/` is the reference implementation. Copy its shape for new or migrated features.**
`app/features/watched/` follows the same shape and shows cache seeding from list data.
`app/features/watchlists/` shows list queries seeded from loaders and a mutation that updates several caches.
`app/features/reviews/` shows a route that is public to read (`publicApiRoute` loader) but needs an account to write (`apiRoute` action).
`app/features/collections/` shows a page query seeded from its loader (`useCollection(id, { initialData })`) so mutations update the page without revalidating.
Legacy folders still work, but don't add new feature code to them.

```
app/
  routes/                  # thin: parse params, call feature functions, render
  features/<name>/
    index.ts               # public client-safe API; the only thing other code imports
    index.server.ts        # public server-only API (services used by routes/other servers)
    types.ts               # domain types (DB row shapes)
    api.ts                 # client fetchers built on apiFetch
    queries.ts             # query key factory + useX / useUpdateX hooks
    server/*.server.ts     # Supabase data access
    components/            # feature UI
    <constants>.ts         # client+server safe constants (e.g. tiers.ts)
  shared/                  # no feature imports allowed
    errors.ts              # AppError + ValidationError/UnauthorizedError/NotFoundError/ConflictError
    api/route.server.ts    # apiRoute(), requireIntParam(), readJsonBody()
    api/client.ts          # apiFetch()
    api/types.ts           # ApiResponse envelope
    query/                 # app-wide QueryProvider (mounted in root.tsx)
    ui/                    # InlineError, notifyError
```

Import rules (enforced by ESLint):
- Import a feature only via `~/features/<name>` or `~/features/<name>/index.server`, never its internals.
- Inside a feature, use relative imports.
- `shared/` must not import from `features/`.
- Never re-export `.server` code from `index.ts`; it breaks the client build.

## API routes

Resource routes use `apiRoute`. It handles auth, method dispatch, error mapping and Supabase cookie headers:

```ts
const route = apiRoute({
  GET: ({ params, user, supabase }) => getThing(user.id, requireIntParam(params, "id"), supabase),
  POST: async ({ request, params, user, supabase }) => { const body = await readJsonBody(request); ... },
});
export const loader = route;
export const action = route;
```

- Success responses are always `{ data }`. Errors are always `{ error: { code, message } }` with a real status code.
- Validate input in the route; enforce business rules in the server service.
- Server services throw typed errors from `~/shared/errors`, never `new Error(...)` for expected failures:
  400 `ValidationError`, 401 `UnauthorizedError`, 404 `NotFoundError`, 409 `ConflictError`. Give each a specific `code`, e.g. `"MOVIE_NOT_WATCHED"`.
- 4xx messages are shown to users, so write them for users. Unknown errors are logged and sent as a generic 500.
- Server services take `supabase: SupabaseClient` as their last argument and `throw` Supabase errors (`if (error) throw error`).

## State management

| State | Tool |
|---|---|
| Data a page needs to render | Remix `loader` + `useLoaderData` |
| Data fetched from the client (panels, dialogs, per-item status) | `useQuery` via the feature's `queries.ts` |
| Writes | `useMutation`: optimistic `onMutate`, rollback + `notifyError` in `onError`, `invalidateQueries` in `onSettled` (or `setQueryData` in `onSuccess` when the response is the new state) |
| Filters, search, pagination | URL search params |
| Local UI (open/closed, form drafts) | `useState`. Use context only for UI state shared across distant components |

- Query keys come from a factory per feature (`ratingKeys.detail(id)`), never inline arrays.
- Don't `fetch()` inside components or roll your own `useEffect` + `useState` loading/error state.
- Don't use window events or context flags to signal "data changed". Invalidate the query instead.
- When a list already has per-item state from the server, seed each item's query with `initialData`
  (e.g. `useMovieWatched(id, { initialWatched })`) instead of fetching per row. Only seed with server truth.
- Give list rows a stable `key` (the item id), never the index. Don't copy props into `useState`.

## Domain rules

- **Watched (movies):** `user_watched_movies` is the only source of truth. Read and write it through
  `~/features/watched`. `watchlist_items.is_seen` is overwritten from it by `applyWatchedStatus` in the
  watchlist loaders and is only authoritative for TV items (`media_type === "tv"`).
- Rating, reviewing and favouriting a movie all require it to be watched.
- Ratings, reviews and favourites are movie-only: their tables key on `tmdb_movie_id` with no media type,
  so never write a TV id to them. One review per user per movie; reviews are publicly readable.
- **Collections:** visibility is `is_public`, never `is_system_generated`. Curated collections have no owner and are
  public; a user's own lists and their AI/generated lists (`is_system_generated = true`) are private to them. Users can't
  make a collection public (RLS enforces it); curated ones are created with the service role. Read and write through
  `~/features/collections`. TMDB film series ("The Matrix Collection") are a different thing: `api.tmdb-collections.$collectionId`
  and `components/collections/` (info panel, previews).
- **Taste:** `~/features/taste` owns the taste profile (`user_taste_profiles`), the user's own preferences
  (`user_taste_preferences`) and the "For you" lists, which are private generated collections with
  `generated_from.type = 'taste'`. The profile is rebuilt only when its fingerprint (ratings, favourites, recent watched,
  watchlist, preferences) changes. Lists regenerate from the client when stale, at most once a day automatically, with a
  manual refresh (5-minute cooldown) and a per-user lock (`lists_generating_since`). Loaders only read; never generate in a loader.
- **Watchlists:** the client addresses lists as `"default"`, `"popcorn"` or a uuid (`watchlistRef(list)`).
  The server resolves `"default"` (creating it on first use); `"popcorn"` is a cookie, so its routes use
  `publicApiRoute` and work signed out. Add or remove movies with `useSetWatchlistMembership`, which refreshes
  every cached copy of the list. After any other change to a list's contents, call `invalidateListContents`.

## Database (Supabase)

- Schema changes go in a new file in `supabase/migrations/`, never as edits to an applied migration.
  `20261021013720_remote_schema.sql` is the baseline taken from production. `migrations/_archive/` holds
  the old hand-run scripts; it isn't applied, so don't add to it.
- Every user-owned table has RLS enabled, with policies that check `auth.uid()`. Add or change a policy
  only with a pgTAP test in `supabase/tests/<table>_rls.test.sql`. Copy the shape of
  `user_watched_movies_rls.test.sql`: two users, checks for signed-out (`anon`), own rows and the other user's rows.
- Functions are `SECURITY INVOKER` so RLS applies. Never filter on a caller-supplied `user_id` inside a
  `SECURITY DEFINER` function; that lets anyone read any user's rows (see `fix_ai_queries_fuzzy_matching.sql`).
- After `npx supabase migration up` locally, new columns may 404 until PostgREST reloads its schema:
  `docker exec supabase_db_story-arc-app psql -U postgres -c "NOTIFY pgrst, 'reload schema'"`.
- PostgREST can reject an `.or()` filter on an update with 42703 "column does not exist". Use plain filters
  (e.g. compare-and-set on the value you read, as in `features/taste/server/lists.server.ts`).
- The app uses the anon key with the user's session, so RLS is what protects user data. Server services
  still filter by `user.id`, but that doesn't replace a policy.

## Loading and error states

- **Query loading:** a `Skeleton` sized like the content, not a spinner or "Loading..." text.
- **Query error:** `<InlineError fallback="Couldn't load X." error={error} onRetry={() => refetch()} />`.
- **Mutation pending:** optimistic UI; use a button `loading` prop only when there's nothing to show optimistically.
- **Mutation error:** `notifyError("Couldn't save X", error)` toast + rollback.
- Use `getErrorMessage(error, fallback)` when displaying any caught error.

## Chakra gotchas

- A `Select`/`Menu`/`Combobox` inside a `Dialog` or `Drawer` must not portal its positioner (`<Portal disabled>`):
  a modal blocks interaction with portalled content. Shared popups call `usePortalled(props.portalled)` from
  `~/shared/ui/portal-context`; wrap a modal's body in `<InsideModal>` when it reuses components written for the page.

## Layout and mobile

- `_layout/route.tsx` is the shell. From `md` up: side panel | content | resizable info panel.
  Below `md`: the side panel is hidden, `components/layout/mobile-nav.tsx` shows a bottom tab bar that opens each
  nav section as a bottom sheet, and the info panel opens as a full-height drawer.
- The layout owns the main panel's height and scrolling (fixed height and `overflowY="auto"` from `md` up, normal
  page scroll on phones). Page components must not set `height="calc(100vh - ...)"` or their own scroll container.
- Nav sections are defined once in `components/sidepanel/nav-sections.tsx`; add sections there, not in either shell.
- Hide/show shell pieces with responsive `display` (CSS), not `useBreakpointValue`, so server HTML matches the
  phone layout. `useBreakpointValue` is only safe for UI that opens after a click (like the info panel).
- Check phone layouts at 390px wide; pages must not scroll horizontally.

## Not yet migrated (known gaps)

- Pages don't have `ErrorBoundary` exports yet. Loaders still return `json({ error })` instead of throwing.
- `_layout.genres.$genre`, `_layout.tags.$tag` and `_layout.search.results` wrap themselves in their own
  `ReactQueryProvider`, because `_common/results-layout.tsx` uses a query key without the route identity.
  Fix the key before removing those providers.
- `components/user-actions/watchlist/watched-actions-modal.tsx` composes ratings, favourites and reviews.
  It lives outside the features (like a route would) and only uses their public APIs.
- There are no public user profiles, so other people's reviews show as "Filmarc member".
- `features/watchlists/server/watchlists.server.ts` and `popcorn.server.ts` call `getMovieDetailsById` for
  every item, including TV series (`media_type === "tv"`), so TV items in watchlists get the wrong details.
- TV watched state (`is_seen`, `user_watched_tv_episodes`) hasn't moved to React Query yet.
- Saved TV series/seasons/episodes still use `WatchlistContext` change flags and `useOptimisticToggle`.
  Don't add new flags; move them to React Query when that area is migrated.
- Watchlist CRUD (`api.watchlists.$id` PATCH/DELETE, `edit-watchlist-dialog`) and the `is_seen` routes
  (`api.watchlists.*.movies.$movieId`) aren't on `apiRoute` yet.
