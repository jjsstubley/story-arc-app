-- Film story data: TMDB metadata, an LLM-generated story profile and an
-- embedding per movie, plus the queue the film-profile-worker Edge Function
-- drains. Movies only; TMDB movie and TV ids can collide, so TV gets its own
-- tables later. Only the service role writes the film tables.

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Basic metadata, synced from TMDB by the worker
CREATE TABLE public.movies (
  tmdb_movie_id integer PRIMARY KEY,
  title text NOT NULL,
  original_title text,
  release_date date,
  runtime integer,
  -- ISO 639-1, e.g. 'ko'
  original_language text,
  genre_ids integer[] NOT NULL DEFAULT '{}',
  keywords text[] NOT NULL DEFAULT '{}',
  popularity real,
  vote_average real,
  vote_count integer,
  poster_path text,
  overview text,
  imdb_id text,
  wikidata_id text,
  tmdb_synced_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_movies_genre_ids ON public.movies USING gin (genre_ids);

-- LLM-generated story data. Text facets are checked against the vocabulary in
-- supabase/functions/_shared/film-vocabulary.ts, not SQL enums, so the
-- vocabulary can change without a migration (bump vocab_version instead).
-- ending_type and character_arc are spoilers: match on them, don't show them.
CREATE TABLE public.film_story_profiles (
  tmdb_movie_id integer PRIMARY KEY REFERENCES public.movies (tmdb_movie_id) ON DELETE CASCADE,
  -- Same axes and scale as user_taste_preferences.story_axes: -2 (low end) to 2 (high end)
  axis_ending smallint NOT NULL CHECK (axis_ending BETWEEN -2 AND 2),
  axis_pacing smallint NOT NULL CHECK (axis_pacing BETWEEN -2 AND 2),
  axis_structure smallint NOT NULL CHECK (axis_structure BETWEEN -2 AND 2),
  axis_focus smallint NOT NULL CHECK (axis_focus BETWEEN -2 AND 2),
  axis_tone smallint NOT NULL CHECK (axis_tone BETWEEN -2 AND 2),
  axis_resolution smallint NOT NULL CHECK (axis_resolution BETWEEN -2 AND 2),
  arc_type text NOT NULL,
  character_arc text NOT NULL,
  ending_type text NOT NULL,
  conflict text NOT NULL,
  protagonist text NOT NULL,
  moral_complexity smallint NOT NULL CHECK (moral_complexity BETWEEN 0 AND 3),
  violence smallint NOT NULL CHECK (violence BETWEEN 0 AND 3),
  tension smallint NOT NULL CHECK (tension BETWEEN 0 AND 3),
  themes text[] NOT NULL DEFAULT '{}',
  moods text[] NOT NULL DEFAULT '{}',
  emotional_effects text[] NOT NULL DEFAULT '{}',
  devices text[] NOT NULL DEFAULT '{}',
  watch_contexts text[] NOT NULL DEFAULT '{}',
  tropes text[] NOT NULL DEFAULT '{}',
  setting_era text,
  setting_scale text,
  -- The paragraph that gets embedded: story qualities, not plot details
  story_card text NOT NULL,
  confidence real NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  plot_source text NOT NULL CHECK (plot_source IN ('wikipedia', 'tmdb')),
  wikipedia_title text,
  vocab_version integer NOT NULL,
  model text NOT NULL,
  -- Hash of the inputs; the worker skips the LLM when it hasn't changed
  source_hash text NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_film_story_profiles_themes ON public.film_story_profiles USING gin (themes);
CREATE INDEX idx_film_story_profiles_moods ON public.film_story_profiles USING gin (moods);

-- Separate from the profile so the embedding model can change, or more kinds
-- can be added, without touching profiles
CREATE TABLE public.film_embeddings (
  tmdb_movie_id integer NOT NULL REFERENCES public.movies (tmdb_movie_id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'story',
  model text NOT NULL,
  embedding extensions.halfvec(1536) NOT NULL,
  source_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tmdb_movie_id, kind)
);

CREATE INDEX idx_film_embeddings_embedding ON public.film_embeddings
  USING hnsw (embedding extensions.halfvec_cosine_ops);

-- One row per movie. Users can add a movie (insert only); the worker claims,
-- updates and requeues rows with the service role.
CREATE TABLE public.film_profile_jobs (
  tmdb_movie_id integer PRIMARY KEY,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'done', 'failed')),
  -- e.g. 'user_action', 'backfill', 'vocab_change'
  reason text NOT NULL DEFAULT 'user_action',
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  locked_at timestamptz,
  finished_at timestamptz
);

CREATE INDEX idx_film_profile_jobs_status ON public.film_profile_jobs (status, requested_at);

ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.film_story_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.film_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.film_profile_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read movies" ON public.movies
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can read film story profiles" ON public.film_story_profiles
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can read film embeddings" ON public.film_embeddings
  FOR SELECT TO anon, authenticated USING (true);

-- Only fresh pending rows: users can't skip the queue's bookkeeping
CREATE POLICY "Signed-in users can request a film profile" ON public.film_profile_jobs
  FOR INSERT TO authenticated
  WITH CHECK (status = 'pending' AND attempts = 0 AND locked_at IS NULL AND finished_at IS NULL);

-- Queue a profile when a user rates, favourites, watches or saves a movie.
-- SECURITY INVOKER: it runs as the user, under the insert policy above. A
-- failure here must never break the user's write, so it only warns. Not ON
-- CONFLICT: RLS rejects that without a SELECT policy, and users can't read
-- the queue, so an already-queued movie is a unique_violation we ignore.
CREATE FUNCTION public.enqueue_film_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  movie_id integer;
BEGIN
  IF TG_TABLE_NAME = 'watchlist_items' THEN
    IF coalesce(NEW.media_type, 'movie') <> 'movie' THEN
      RETURN NEW;
    END IF;
    movie_id := NEW.tmdb_id;
  ELSE
    movie_id := NEW.tmdb_movie_id;
  END IF;

  BEGIN
    INSERT INTO public.film_profile_jobs (tmdb_movie_id) VALUES (movie_id);
  EXCEPTION
  WHEN unique_violation THEN
    NULL;
  WHEN others THEN
    RAISE WARNING 'enqueue_film_profile(%): %', movie_id, SQLERRM;
  END;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enqueue_film_profile AFTER INSERT ON public.user_ratings
  FOR EACH ROW EXECUTE FUNCTION public.enqueue_film_profile();
CREATE TRIGGER enqueue_film_profile AFTER INSERT ON public.user_favourites
  FOR EACH ROW EXECUTE FUNCTION public.enqueue_film_profile();
CREATE TRIGGER enqueue_film_profile AFTER INSERT ON public.user_watched_movies
  FOR EACH ROW EXECUTE FUNCTION public.enqueue_film_profile();
CREATE TRIGGER enqueue_film_profile AFTER INSERT ON public.watchlist_items
  FOR EACH ROW EXECUTE FUNCTION public.enqueue_film_profile();

-- Claims up to batch_size jobs for the worker: pending ones, plus running ones
-- whose worker died. SKIP LOCKED lets overlapping runs take different rows.
CREATE FUNCTION public.claim_film_profile_jobs(batch_size integer)
RETURNS TABLE (tmdb_movie_id integer, attempts integer)
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  UPDATE public.film_profile_jobs AS job
  SET status = 'running', locked_at = now(), attempts = job.attempts + 1
  WHERE job.tmdb_movie_id IN (
    SELECT candidate.tmdb_movie_id
    FROM public.film_profile_jobs AS candidate
    WHERE candidate.status = 'pending'
       OR (candidate.status = 'running' AND candidate.locked_at < now() - interval '10 minutes')
    ORDER BY candidate.requested_at
    LIMIT batch_size
    FOR UPDATE SKIP LOCKED
  )
  RETURNING job.tmdb_movie_id, job.attempts;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_film_profile_jobs(integer) FROM public, anon, authenticated;

-- Nearest movies to an arbitrary vector (e.g. a free-text search embedding)
CREATE FUNCTION public.match_movies(
  query_embedding extensions.halfvec(1536),
  match_count integer,
  exclude_ids integer[] DEFAULT '{}'
)
RETURNS TABLE (tmdb_movie_id integer, similarity real)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
-- HNSW returns at most ef_search rows (default 40), whatever the LIMIT
SET hnsw.ef_search = 400
AS $$
  SELECT nearest.tmdb_movie_id, nearest.similarity
  FROM (
    SELECT e.tmdb_movie_id, (1 - (e.embedding OPERATOR(extensions.<=>) query_embedding))::real AS similarity
    FROM public.film_embeddings AS e
    WHERE e.kind = 'story'
    ORDER BY e.embedding OPERATOR(extensions.<=>) query_embedding
    -- Over-fetch so excluded movies don't leave the result short
    LIMIT least(400, match_count + coalesce(cardinality(exclude_ids), 0))
  ) AS nearest
  WHERE NOT (nearest.tmdb_movie_id = ANY (exclude_ids))
  ORDER BY nearest.similarity DESC
  LIMIT match_count;
$$;

-- Nearest movies to each seed movie, in one query. Seeds without an embedding
-- are skipped. Used for "Similar stories" (one seed) and "For you" candidates.
CREATE FUNCTION public.similar_to_seeds(
  seed_ids integer[],
  per_seed integer,
  exclude_ids integer[] DEFAULT '{}'
)
RETURNS TABLE (tmdb_movie_id integer, seed_id integer, similarity real)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
-- HNSW returns at most ef_search rows (default 40), whatever the LIMIT
SET hnsw.ef_search = 400
AS $$
  SELECT ranked.tmdb_movie_id, ranked.seed_id, ranked.similarity
  FROM public.film_embeddings AS seed
  CROSS JOIN LATERAL (
    SELECT nearest.tmdb_movie_id, seed.tmdb_movie_id AS seed_id, nearest.similarity
    FROM (
      SELECT e.tmdb_movie_id, (1 - (e.embedding OPERATOR(extensions.<=>) seed.embedding))::real AS similarity
      FROM public.film_embeddings AS e
      WHERE e.kind = 'story'
      ORDER BY e.embedding OPERATOR(extensions.<=>) seed.embedding
      LIMIT least(400, per_seed + cardinality(seed_ids) + coalesce(cardinality(exclude_ids), 0))
    ) AS nearest
    WHERE NOT (nearest.tmdb_movie_id = ANY (seed_ids))
      AND NOT (nearest.tmdb_movie_id = ANY (exclude_ids))
    ORDER BY nearest.similarity DESC
    LIMIT per_seed
  ) AS ranked
  WHERE seed.kind = 'story' AND seed.tmdb_movie_id = ANY (seed_ids);
$$;
