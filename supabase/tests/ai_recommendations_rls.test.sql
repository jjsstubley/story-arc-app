-- RLS for ai_recommendations: access is decided by who owns the parent ai_queries row.
-- Run with: npx supabase test db

BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SELECT plan(7);

-- Fixtures (as postgres, so RLS doesn't apply yet)
INSERT INTO auth.users (id, email) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a@test.com'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b@test.com');

INSERT INTO ai_queries (id, prompt, generated_by) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'cosy mysteries', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('b0000000-0000-0000-0000-000000000001', 'space horror',   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

INSERT INTO ai_recommendations (ai_query_id, movie_id) VALUES
  ('a0000000-0000-0000-0000-000000000001', 550),
  ('b0000000-0000-0000-0000-000000000001', 680);

-- Signed in as user A
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', true);

SELECT results_eq(
  $$ SELECT prompt FROM ai_queries $$,
  $$ VALUES ('cosy mysteries'::text) $$,
  'User A only sees their own AI queries'
);

SELECT results_eq(
  $$ SELECT movie_id FROM ai_recommendations $$,
  $$ VALUES (550) $$,
  'User A only sees recommendations for their own queries'
);

SELECT lives_ok(
  $$ INSERT INTO ai_recommendations (ai_query_id, movie_id)
     VALUES ('a0000000-0000-0000-0000-000000000001', 13) $$,
  'User A can add a recommendation to their own query'
);

SELECT throws_ok(
  $$ INSERT INTO ai_recommendations (ai_query_id, movie_id)
     VALUES ('b0000000-0000-0000-0000-000000000001', 13) $$,
  '42501', NULL,
  'User A cannot add a recommendation to user B''s query'
);

SELECT throws_ok(
  $$ UPDATE ai_recommendations
     SET ai_query_id = 'b0000000-0000-0000-0000-000000000001'
     WHERE movie_id = 550 $$,
  '42501', NULL,
  'User A cannot move their recommendation onto user B''s query'
);

-- Rows hidden by USING are skipped silently, not an error
DELETE FROM ai_recommendations WHERE movie_id = 680;

RESET ROLE;

SELECT results_eq(
  $$ SELECT count(*)::int FROM ai_recommendations WHERE movie_id = 680 $$,
  $$ VALUES (1) $$,
  'User A cannot delete user B''s recommendation'
);

-- Deleting the parent query cascades to its recommendations
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', true);
DELETE FROM ai_queries WHERE id = 'a0000000-0000-0000-0000-000000000001';

RESET ROLE;

SELECT results_eq(
  $$ SELECT count(*)::int FROM ai_recommendations
     WHERE ai_query_id = 'a0000000-0000-0000-0000-000000000001' $$,
  $$ VALUES (0) $$,
  'Deleting a query removes its recommendations'
);

SELECT * FROM finish();
ROLLBACK;
