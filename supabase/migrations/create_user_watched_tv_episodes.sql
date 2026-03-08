-- Create user_watched_tv_episodes table for "watched" TV episodes (source of truth for season/series completion)
CREATE TABLE IF NOT EXISTS user_watched_tv_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tmdb_series_id INTEGER NOT NULL,
  season_number INTEGER NOT NULL,
  episode_number INTEGER NOT NULL,
  watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tmdb_series_id, season_number, episode_number)
);

-- Indexes for per-season and per-series lookups
CREATE INDEX IF NOT EXISTS idx_user_watched_tv_episodes_user_id ON user_watched_tv_episodes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_watched_tv_episodes_user_series ON user_watched_tv_episodes(user_id, tmdb_series_id);
CREATE INDEX IF NOT EXISTS idx_user_watched_tv_episodes_user_series_season ON user_watched_tv_episodes(user_id, tmdb_series_id, season_number);

-- Enable RLS
ALTER TABLE user_watched_tv_episodes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own watched TV episodes"
  ON user_watched_tv_episodes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watched TV episodes"
  ON user_watched_tv_episodes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watched TV episodes"
  ON user_watched_tv_episodes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watched TV episodes"
  ON user_watched_tv_episodes FOR DELETE
  USING (auth.uid() = user_id);
