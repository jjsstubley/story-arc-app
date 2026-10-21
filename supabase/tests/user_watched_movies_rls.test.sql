-- RLS for user_watched_movies: users can only read and write their own rows.
-- Run with: npx supabase test db

BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SELECT plan(9);

-- Fixtures (as postgres, so RLS doesn't apply yet)
INSERT INTO auth.users (id, email) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a@test.com'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b@test.com');

INSERT INTO user_watched_movies (user_id, tmdb_movie_id) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 550),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 680);

-- Signed out
SET LOCAL ROLE anon;

SELECT is_empty(
  $$ SELECT * FROM user_watched_movies $$,
  'Signed-out users see no watched movies'
);

-- Signed in as user A
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', true);

SELECT results_eq(
  $$ SELECT tmdb_movie_id FROM user_watched_movies $$,
  $$ VALUES (550) $$,
  'User A only sees their own watched movies'
);

SELECT lives_ok(
  $$ INSERT INTO user_watched_movies (user_id, tmdb_movie_id)
     VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 13) $$,
  'User A can mark a movie watched for themselves'
);

SELECT throws_ok(
  $$ INSERT INTO user_watched_movies (user_id, tmdb_movie_id)
     VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 13) $$,
  '42501', NULL,
  'User A cannot mark a movie watched for user B'
);

-- UPDATE has only USING, so Postgres reuses it as WITH CHECK
SELECT throws_ok(
  $$ UPDATE user_watched_movies
     SET user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
     WHERE tmdb_movie_id = 550 $$,
  '42501', NULL,
  'User A cannot reassign their row to user B'
);

-- Rows hidden by USING are skipped silently, not an error
UPDATE user_watched_movies SET tmdb_movie_id = 999 WHERE tmdb_movie_id = 680;
DELETE FROM user_watched_movies WHERE tmdb_movie_id = 680;

-- Check B's row as postgres
RESET ROLE;

SELECT results_eq(
  $$ SELECT tmdb_movie_id FROM user_watched_movies
     WHERE user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' $$,
  $$ VALUES (680) $$,
  'User A cannot update or delete user B''s row'
);

-- Signed in as user B
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"}', true);

SELECT results_eq(
  $$ SELECT tmdb_movie_id FROM user_watched_movies $$,
  $$ VALUES (680) $$,
  'User B only sees their own watched movies'
);

SELECT lives_ok(
  $$ DELETE FROM user_watched_movies WHERE tmdb_movie_id = 680 $$,
  'User B can delete their own row'
);

SELECT is_empty(
  $$ SELECT * FROM user_watched_movies $$,
  'User B''s row is gone after deleting it'
);

SELECT * FROM finish();
ROLLBACK;
