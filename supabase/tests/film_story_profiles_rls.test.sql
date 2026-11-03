-- RLS for movies, film_story_profiles, film_embeddings and film_profile_jobs:
-- anyone can read the film tables, only the service role writes them, and
-- signed-in users can only add pending jobs. Run with: npx supabase test db

BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SELECT plan(18);

-- Fixtures (as postgres, so RLS doesn't apply yet)
INSERT INTO auth.users (id, email) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a@test.com'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b@test.com');

INSERT INTO movies (tmdb_movie_id, title) VALUES (77, 'Memento'), (320, 'Insomnia'), (1366, 'Rocky');

INSERT INTO film_story_profiles (
  tmdb_movie_id, axis_ending, axis_pacing, axis_structure, axis_focus, axis_tone, axis_resolution,
  arc_type, character_arc, ending_type, conflict, protagonist, moral_complexity, violence, tension,
  logline, story_card, confidence, plot_source, vocab_version, model, source_hash
) VALUES (
  77, 1, 0, 2, -1, 1, 1,
  'Tragedy', 'Disillusionment', 'Twist', 'Self', 'Unreliable narrator', 3, 2, 3,
  'A puzzle-box revenge story', 'A puzzle-box revenge story told backwards', 0.9, 'wikipedia', 1, 'test', 'h77'
);

-- Memento and Insomnia point the same way; Rocky is orthogonal
INSERT INTO film_embeddings (tmdb_movie_id, model, embedding, source_hash) VALUES
  (77, 'test', (ARRAY[1, 0]::real[] || array_fill(0::real, ARRAY[1534]))::extensions.vector::extensions.halfvec, 'h77'),
  (320, 'test', (ARRAY[0.9, 0.1]::real[] || array_fill(0::real, ARRAY[1534]))::extensions.vector::extensions.halfvec, 'h320'),
  (1366, 'test', (ARRAY[0, 1]::real[] || array_fill(0::real, ARRAY[1534]))::extensions.vector::extensions.halfvec, 'h1366');

INSERT INTO film_profile_jobs (tmdb_movie_id, status) VALUES (550, 'failed');

-- Signed out
SET LOCAL ROLE anon;

SELECT results_eq(
  $$ SELECT title FROM movies WHERE tmdb_movie_id = 77 $$,
  $$ VALUES ('Memento') $$,
  'Signed-out users can read movies'
);

SELECT results_eq(
  $$ SELECT arc_type FROM film_story_profiles $$,
  $$ VALUES ('Tragedy') $$,
  'Signed-out users can read story profiles'
);

SELECT throws_ok(
  $$ INSERT INTO movies (tmdb_movie_id, title) VALUES (13, 'Forrest Gump') $$,
  '42501', NULL,
  'Signed-out users cannot add movies'
);

SELECT throws_ok(
  $$ INSERT INTO film_profile_jobs (tmdb_movie_id) VALUES (13) $$,
  '42501', NULL,
  'Signed-out users cannot request a film profile'
);

SELECT results_eq(
  $$ SELECT tmdb_movie_id FROM similar_to_seeds(ARRAY[77], 1) $$,
  $$ VALUES (320) $$,
  'similar_to_seeds returns the nearest movie, not the seed'
);

-- Signed in as user A
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', true);

SELECT is(
  (SELECT count(*)::int FROM film_embeddings),
  3,
  'Signed-in users can read embeddings'
);

SELECT throws_ok(
  $$ INSERT INTO film_embeddings (tmdb_movie_id, model, embedding, source_hash)
     SELECT 1366, 'other', embedding, 'x' FROM film_embeddings WHERE tmdb_movie_id = 77 $$,
  '42501', NULL,
  'Signed-in users cannot write embeddings'
);

-- No UPDATE/DELETE policy: rows are skipped silently, checked below as postgres
UPDATE movies SET title = 'Hacked' WHERE tmdb_movie_id = 77;
DELETE FROM film_story_profiles WHERE tmdb_movie_id = 77;

SELECT lives_ok(
  $$ INSERT INTO film_profile_jobs (tmdb_movie_id) VALUES (13) $$,
  'User A can request a film profile'
);

-- The enqueue trigger ignores this; see the watched inserts below
SELECT throws_ok(
  $$ INSERT INTO film_profile_jobs (tmdb_movie_id) VALUES (13) $$,
  '23505', NULL,
  'Requesting an already-queued film is a unique violation'
);

SELECT throws_ok(
  $$ INSERT INTO film_profile_jobs (tmdb_movie_id, status) VALUES (14, 'done') $$,
  '42501', NULL,
  'User A cannot add a job that is already done'
);

SELECT is_empty(
  $$ SELECT * FROM film_profile_jobs $$,
  'User A cannot read the queue'
);

UPDATE film_profile_jobs SET status = 'pending' WHERE tmdb_movie_id = 550;
DELETE FROM film_profile_jobs WHERE tmdb_movie_id = 550;

SELECT throws_ok(
  $$ SELECT * FROM claim_film_profile_jobs(10) $$,
  '42501', NULL,
  'User A cannot claim jobs'
);

-- Watching a movie queues its profile (the trigger runs as user A)
SELECT lives_ok(
  $$ INSERT INTO user_watched_movies (user_id, tmdb_movie_id)
     VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 680) $$,
  'User A can still mark a movie watched'
);

-- Watching a movie that's already queued still works
SELECT lives_ok(
  $$ INSERT INTO user_watched_movies (user_id, tmdb_movie_id)
     VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 550) $$,
  'Watching an already-queued movie still works'
);

-- Check as postgres
RESET ROLE;

SELECT results_eq(
  $$ SELECT title FROM movies WHERE tmdb_movie_id = 77 $$,
  $$ VALUES ('Memento') $$,
  'User A cannot update movies'
);

SELECT is(
  (SELECT count(*)::int FROM film_story_profiles),
  1,
  'User A cannot delete story profiles'
);

SELECT results_eq(
  $$ SELECT status FROM film_profile_jobs WHERE tmdb_movie_id = 550 $$,
  $$ VALUES ('failed') $$,
  'User A cannot update or delete jobs'
);

SELECT results_eq(
  $$ SELECT status, reason FROM film_profile_jobs WHERE tmdb_movie_id = 680 $$,
  $$ VALUES ('pending', 'user_action') $$,
  'Watching a movie queues a pending profile job'
);

SELECT * FROM finish();
ROLLBACK;
