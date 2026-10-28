-- RLS for user_taste_profiles and user_taste_preferences: users can only read
-- and write their own rows. Run with: npx supabase test db

BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SELECT plan(15);

-- Fixtures (as postgres, so RLS doesn't apply yet)
INSERT INTO auth.users (id, email) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a@test.com'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b@test.com');

INSERT INTO user_taste_profiles (user_id, summary, fingerprint) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'A likes noir', 'fa'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'B likes musicals', 'fb');

INSERT INTO user_taste_preferences (user_id, notes) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'B notes');

-- Signed out
SET LOCAL ROLE anon;

SELECT is_empty($$ SELECT * FROM user_taste_profiles $$, 'Signed-out users see no taste profiles');
SELECT is_empty($$ SELECT * FROM user_taste_preferences $$, 'Signed-out users see no taste preferences');

-- Signed in as user A
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', true);

SELECT results_eq(
  $$ SELECT summary FROM user_taste_profiles $$,
  $$ VALUES ('A likes noir') $$,
  'User A only sees their own taste profile'
);

SELECT is_empty($$ SELECT * FROM user_taste_preferences $$, 'User A cannot see user B''s preferences');

SELECT lives_ok(
  $$ INSERT INTO user_taste_preferences (user_id, favourite_genre_ids, notes)
     VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{80}', 'slow-burn') $$,
  'User A can save their own preferences'
);

SELECT throws_ok(
  $$ INSERT INTO user_taste_preferences (user_id) VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb') $$,
  '42501', NULL,
  'User A cannot save preferences for user B'
);

SELECT throws_ok(
  $$ UPDATE user_taste_preferences SET favourite_genre_ids = '{27}', avoided_genre_ids = '{27}'
     WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  '23514', NULL,
  'A genre cannot be both favoured and avoided'
);

SELECT lives_ok(
  $$ UPDATE user_taste_preferences
     SET story_axes = '{"pacing": -2}', arc_types = '{Redemption}',
         comparisons = '[{"pair": "structure-1", "pick": "high"}]',
         people = '[{"id": 525, "name": "Christopher Nolan", "role": "director"}]',
         onboarded_at = now()
     WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  'User A can save their own story preferences'
);

SELECT throws_ok(
  $$ UPDATE user_taste_preferences SET story_axes = '[]'
     WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  '23514', NULL,
  'story_axes must be an object'
);

SELECT throws_ok(
  $$ UPDATE user_taste_preferences SET user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
     WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  '42501', NULL,
  'User A cannot reassign their preferences to user B'
);

SELECT throws_ok(
  $$ UPDATE user_taste_profiles SET user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
     WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  '42501', NULL,
  'User A cannot reassign their taste profile to user B'
);

SELECT lives_ok(
  $$ UPDATE user_taste_profiles SET lists_generating_since = now()
     WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  'User A can take the list-generation lock on their own profile'
);

-- Rows hidden by USING are skipped silently, not an error
UPDATE user_taste_profiles SET summary = 'hacked' WHERE user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
UPDATE user_taste_preferences SET notes = 'hacked' WHERE user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
DELETE FROM user_taste_profiles WHERE user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

RESET ROLE;

SELECT results_eq(
  $$ SELECT summary FROM user_taste_profiles WHERE user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' $$,
  $$ VALUES ('B likes musicals') $$,
  'User A cannot change or delete user B''s profile'
);

SELECT results_eq(
  $$ SELECT notes FROM user_taste_preferences WHERE user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' $$,
  $$ VALUES ('B notes') $$,
  'User A cannot change user B''s preferences'
);

-- Signed in as user B
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"}', true);

SELECT results_eq(
  $$ SELECT notes FROM user_taste_preferences $$,
  $$ VALUES ('B notes') $$,
  'User B only sees their own preferences'
);

SELECT * FROM finish();
ROLLBACK;
