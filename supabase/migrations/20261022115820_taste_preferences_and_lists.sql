-- Preferences a user sets themselves, fed into their taste profile.
CREATE TABLE public.user_taste_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  -- TMDB genre ids
  favourite_genre_ids integer[] NOT NULL DEFAULT '{}',
  avoided_genre_ids integer[] NOT NULL DEFAULT '{}',
  -- Decades such as '1970s'; empty means any
  eras text[] NOT NULL DEFAULT '{}',
  -- ISO 639-1 original languages, e.g. 'ko'; empty means any
  languages text[] NOT NULL DEFAULT '{}',
  notes text CHECK (char_length(notes) <= 500),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT favourite_and_avoided_genres_disjoint CHECK (NOT (favourite_genre_ids && avoided_genre_ids))
);

ALTER TABLE public.user_taste_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own taste preferences" ON public.user_taste_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own taste preferences" ON public.user_taste_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own taste preferences" ON public.user_taste_preferences
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own taste preferences" ON public.user_taste_preferences
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_taste_preferences_updated_at
  BEFORE UPDATE ON public.user_taste_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- "For you" lists are private generated collections (generated_from.type =
-- 'taste'). These track which profile they were built from, so they are only
-- regenerated when the profile changes, and a short lock so two requests
-- can't generate at once.
ALTER TABLE public.user_taste_profiles
  ADD COLUMN lists_fingerprint text,
  ADD COLUMN lists_generated_at timestamptz,
  ADD COLUMN lists_generating_since timestamptz;

-- The existing UPDATE policy has no WITH CHECK, so Postgres reuses USING;
-- make it explicit so a row can't be reassigned to another user.
DROP POLICY IF EXISTS "Users can update their own taste profile" ON public.user_taste_profiles;
CREATE POLICY "Users can update their own taste profile" ON public.user_taste_profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
