-- Cached LLM-generated taste profile per user, built from ratings + favourites.
-- Regenerated only when the fingerprint of those inputs changes.
CREATE TABLE IF NOT EXISTS user_taste_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  likes JSONB,
  dislikes JSONB,
  anchors JSONB,
  fingerprint TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_taste_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own taste profile"
  ON user_taste_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own taste profile"
  ON user_taste_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own taste profile"
  ON user_taste_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own taste profile"
  ON user_taste_profiles FOR DELETE
  USING (auth.uid() = user_id);
