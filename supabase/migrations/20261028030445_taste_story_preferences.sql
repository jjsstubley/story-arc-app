-- Story preferences and onboarding for the taste profile. Shapes are
-- validated by the app (features/taste/server/preferences.server.ts); these
-- checks only guard the column types and sizes.
ALTER TABLE public.user_taste_preferences
  -- Story axis scores from -2 to 2, e.g. {"ending": -1, "pacing": 2}; a missing axis means no preference
  ADD COLUMN story_axes jsonb NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(story_axes) = 'object'),
  -- Arc types the user loves, e.g. 'Redemption'
  ADD COLUMN arc_types text[] NOT NULL DEFAULT '{}' CHECK (cardinality(arc_types) <= 20),
  -- Answers to curated film pairs: [{"pair": "structure-1", "pick": "high"}]
  ADD COLUMN comparisons jsonb NOT NULL DEFAULT '[]'
    CHECK (jsonb_typeof(comparisons) = 'array' AND jsonb_array_length(comparisons) <= 100),
  -- TMDB people: [{"id": 525, "name": "Christopher Nolan", "role": "director"}]
  ADD COLUMN people jsonb NOT NULL DEFAULT '[]'
    CHECK (jsonb_typeof(people) = 'array' AND jsonb_array_length(people) <= 20),
  -- TMDB keywords used as subgenres: [{"id": 207268, "name": "neo-noir"}]
  ADD COLUMN keywords jsonb NOT NULL DEFAULT '[]'
    CHECK (jsonb_typeof(keywords) = 'array' AND jsonb_array_length(keywords) <= 20),
  ADD COLUMN onboarded_at timestamptz,
  ADD COLUMN onboarding_skipped_at timestamptz;

-- Hash of the inputs that always rebuild the profile (ratings, favourites,
-- preferences). Watched films and the watchlist only rebuild an older profile.
ALTER TABLE public.user_taste_profiles
  ADD COLUMN core_fingerprint text;
