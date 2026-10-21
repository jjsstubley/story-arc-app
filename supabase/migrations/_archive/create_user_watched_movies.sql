-- Create user_watched_movies table for global "watched" state (independent of watchlist)
CREATE TABLE IF NOT EXISTS user_watched_movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tmdb_movie_id INTEGER NOT NULL,
  watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tmdb_movie_id)
);

-- Indexes for lookups and "recently watched" ordering
CREATE INDEX IF NOT EXISTS idx_user_watched_movies_user_id ON user_watched_movies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_watched_movies_user_watched_at ON user_watched_movies(user_id, watched_at DESC);

-- Enable RLS
ALTER TABLE user_watched_movies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own watched movies"
  ON user_watched_movies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watched movies"
  ON user_watched_movies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watched movies"
  ON user_watched_movies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watched movies"
  ON user_watched_movies FOR DELETE
  USING (auth.uid() = user_id);
