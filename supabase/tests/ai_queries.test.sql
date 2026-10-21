-- ai_queries: fuzzy matching via find_similar_queries, and ownership of queries.
-- Run with: npx supabase test db

BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SELECT plan(8);

SELECT has_extension('pg_trgm', 'pg_trgm is enabled for fuzzy prompt matching');

SELECT has_index(
  'public', 'ai_queries', 'idx_ai_queries_generated_by_created_at',
  'ai_queries has an index for looking up a user''s recent queries'
);

-- Fixtures (as postgres, so RLS doesn't apply yet)
INSERT INTO auth.users (id, email) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a@test.com'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b@test.com');

INSERT INTO ai_queries (prompt, generated_by) VALUES
  ('cosy mystery movies', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('space horror',        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

SELECT throws_ok(
  $$ INSERT INTO ai_queries (prompt, generated_by)
     VALUES ('orphan', 'cccccccc-cccc-cccc-cccc-cccccccccccc') $$,
  '23503', NULL,
  'A query must belong to a real user'
);

-- Signed out
SET LOCAL ROLE anon;

SELECT throws_ok(
  $$ SELECT * FROM find_similar_queries('space horror', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 0) $$,
  '42501', NULL,
  'Signed-out users cannot call find_similar_queries'
);

-- Signed in as user A
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', true);

SELECT results_eq(
  $$ SELECT prompt FROM find_similar_queries('cosy mystery films', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') $$,
  $$ VALUES ('cosy mystery movies'::text) $$,
  'find_similar_queries finds a similar prompt from the same user'
);

SELECT is_empty(
  $$ SELECT * FROM find_similar_queries('quarterly tax returns', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') $$,
  'find_similar_queries ignores prompts below the similarity threshold'
);

-- The function must respect RLS, not trust the user_id argument
SELECT is_empty(
  $$ SELECT * FROM find_similar_queries('space horror', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 0) $$,
  'User A cannot read user B''s prompts by passing user B''s id'
);

-- Deleting a user removes their queries
RESET ROLE;
DELETE FROM auth.users WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

SELECT is_empty(
  $$ SELECT * FROM ai_queries WHERE generated_by = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' $$,
  'Deleting a user removes their AI queries'
);

SELECT * FROM finish();
ROLLBACK;
