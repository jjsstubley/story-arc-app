-- RLS for collections and collection_items: public (curated) collections are
-- readable by everyone, everything else only by its owner, and users can't
-- publish. Run with: npx supabase test db

BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SELECT plan(17);

-- Fixtures (as postgres, so RLS doesn't apply yet)
INSERT INTO auth.users (id, email) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a@test.com'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b@test.com');

INSERT INTO collections (id, user_id, name, is_public, is_system_generated) VALUES
  -- curated: no owner, public
  ('c0000000-0000-0000-0000-000000000000', NULL, 'Curated', true, true),
  -- user A's own list and AI list (system-generated but private)
  ('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'A list', false, false),
  ('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'A AI list', false, true),
  -- user B's list
  ('b1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'B list', false, false);

INSERT INTO collection_items (list_id, movie_id) VALUES
  ('c0000000-0000-0000-0000-000000000000', 1),
  ('a1111111-1111-1111-1111-111111111111', 2),
  ('a2222222-2222-2222-2222-222222222222', 3),
  ('b1111111-1111-1111-1111-111111111111', 4);

-- Signed out
SET LOCAL ROLE anon;

SELECT results_eq(
  $$ SELECT name FROM collections ORDER BY name $$,
  $$ VALUES ('Curated') $$,
  'Signed-out users only see public collections'
);

SELECT results_eq(
  $$ SELECT movie_id FROM collection_items ORDER BY movie_id $$,
  $$ VALUES (1) $$,
  'Signed-out users only see items of public collections'
);

-- Signed in as user A
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', true);

SELECT results_eq(
  $$ SELECT name FROM collections ORDER BY name $$,
  $$ VALUES ('A AI list'), ('A list'), ('Curated') $$,
  'User A sees public collections and their own, including their AI list'
);

SELECT results_eq(
  $$ SELECT movie_id FROM collection_items ORDER BY movie_id $$,
  $$ VALUES (1), (2), (3) $$,
  'User A sees items of public collections and their own, not user B''s'
);

SELECT lives_ok(
  $$ INSERT INTO collections (user_id, name) VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'New') $$,
  'User A can create a private collection'
);

SELECT lives_ok(
  $$ INSERT INTO collections (user_id, name, is_system_generated)
     VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Generated', true) $$,
  'User A can create a private generated collection (AI suggestions)'
);

SELECT throws_ok(
  $$ INSERT INTO collections (user_id, name, is_public)
     VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Published', true) $$,
  '42501', NULL,
  'User A cannot create a public collection'
);

SELECT throws_ok(
  $$ INSERT INTO collections (user_id, name) VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'For B') $$,
  '42501', NULL,
  'User A cannot create a collection for user B'
);

SELECT throws_ok(
  $$ UPDATE collections SET is_public = true WHERE id = 'a1111111-1111-1111-1111-111111111111' $$,
  '42501', NULL,
  'User A cannot make their collection public'
);

SELECT lives_ok(
  $$ INSERT INTO collection_items (list_id, movie_id) VALUES ('a1111111-1111-1111-1111-111111111111', 20) $$,
  'User A can add a movie to their own collection'
);

SELECT throws_ok(
  $$ INSERT INTO collection_items (list_id, movie_id) VALUES ('b1111111-1111-1111-1111-111111111111', 20) $$,
  '42501', NULL,
  'User A cannot add a movie to user B''s collection'
);

SELECT throws_ok(
  $$ INSERT INTO collection_items (list_id, movie_id) VALUES ('c0000000-0000-0000-0000-000000000000', 20) $$,
  '42501', NULL,
  'User A cannot add a movie to a curated collection'
);

-- Rows hidden by USING are skipped silently, not an error
UPDATE collections SET name = 'Hacked' WHERE id IN ('b1111111-1111-1111-1111-111111111111', 'c0000000-0000-0000-0000-000000000000');
DELETE FROM collections WHERE id IN ('b1111111-1111-1111-1111-111111111111', 'c0000000-0000-0000-0000-000000000000');
DELETE FROM collection_items WHERE list_id IN ('b1111111-1111-1111-1111-111111111111', 'c0000000-0000-0000-0000-000000000000');

SELECT lives_ok(
  $$ DELETE FROM collection_items WHERE list_id = 'a1111111-1111-1111-1111-111111111111' AND movie_id = 2 $$,
  'User A can remove a movie from their own collection'
);

-- Check the other rows as postgres
RESET ROLE;

SELECT results_eq(
  $$ SELECT name FROM collections WHERE id IN ('b1111111-1111-1111-1111-111111111111', 'c0000000-0000-0000-0000-000000000000') ORDER BY name $$,
  $$ VALUES ('B list'), ('Curated') $$,
  'User A cannot rename or delete user B''s or curated collections'
);

SELECT results_eq(
  $$ SELECT movie_id FROM collection_items WHERE list_id IN ('b1111111-1111-1111-1111-111111111111', 'c0000000-0000-0000-0000-000000000000') ORDER BY movie_id $$,
  $$ VALUES (1), (4) $$,
  'User A cannot remove items from user B''s or curated collections'
);

-- Signed in as user B
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"}', true);

SELECT results_eq(
  $$ SELECT name FROM collections ORDER BY name $$,
  $$ VALUES ('B list'), ('Curated') $$,
  'User B does not see user A''s lists, including their AI list'
);

SELECT results_eq(
  $$ SELECT movie_id FROM collection_items ORDER BY movie_id $$,
  $$ VALUES (1), (4) $$,
  'User B does not see items of user A''s lists'
);

SELECT * FROM finish();
ROLLBACK;
