-- Create saved_tv_series table
CREATE TABLE IF NOT EXISTS saved_tv_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  watchlist_id UUID REFERENCES watchlists(id) ON DELETE CASCADE,
  tmdb_series_id INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_seen BOOLEAN DEFAULT FALSE,
  notes TEXT,
  position INTEGER,
  source VARCHAR(255),
  UNIQUE(user_id, tmdb_series_id)
);

-- Create saved_tv_seasons table
CREATE TABLE IF NOT EXISTS saved_tv_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  watchlist_id UUID REFERENCES watchlists(id) ON DELETE CASCADE,
  tmdb_series_id INTEGER NOT NULL,
  season_number INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_seen BOOLEAN DEFAULT FALSE,
  notes TEXT,
  position INTEGER,
  source VARCHAR(255),
  UNIQUE(user_id, tmdb_series_id, season_number)
);

-- Create saved_tv_episodes table
CREATE TABLE IF NOT EXISTS saved_tv_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  watchlist_id UUID REFERENCES watchlists(id) ON DELETE CASCADE,
  tmdb_series_id INTEGER NOT NULL,
  season_number INTEGER NOT NULL,
  episode_number INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_seen BOOLEAN DEFAULT FALSE,
  notes TEXT,
  position INTEGER,
  source VARCHAR(255),
  UNIQUE(user_id, tmdb_series_id, season_number, episode_number)
);

-- Create indexes for saved_tv_series
CREATE INDEX IF NOT EXISTS idx_saved_tv_series_user_id ON saved_tv_series(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_tv_series_watchlist_id ON saved_tv_series(watchlist_id);
CREATE INDEX IF NOT EXISTS idx_saved_tv_series_tmdb_id ON saved_tv_series(tmdb_series_id);

-- Create indexes for saved_tv_seasons
CREATE INDEX IF NOT EXISTS idx_saved_tv_seasons_user_id ON saved_tv_seasons(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_tv_seasons_watchlist_id ON saved_tv_seasons(watchlist_id);
CREATE INDEX IF NOT EXISTS idx_saved_tv_seasons_series_season ON saved_tv_seasons(tmdb_series_id, season_number);

-- Create indexes for saved_tv_episodes
CREATE INDEX IF NOT EXISTS idx_saved_tv_episodes_user_id ON saved_tv_episodes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_tv_episodes_watchlist_id ON saved_tv_episodes(watchlist_id);
CREATE INDEX IF NOT EXISTS idx_saved_tv_episodes_series_season_episode ON saved_tv_episodes(tmdb_series_id, season_number, episode_number);

-- Enable RLS
ALTER TABLE saved_tv_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_tv_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_tv_episodes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_tv_series
CREATE POLICY "Users can view their own saved series"
  ON saved_tv_series FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved series"
  ON saved_tv_series FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved series"
  ON saved_tv_series FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved series"
  ON saved_tv_series FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for saved_tv_seasons
CREATE POLICY "Users can view their own saved seasons"
  ON saved_tv_seasons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved seasons"
  ON saved_tv_seasons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved seasons"
  ON saved_tv_seasons FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved seasons"
  ON saved_tv_seasons FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for saved_tv_episodes
CREATE POLICY "Users can view their own saved episodes"
  ON saved_tv_episodes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved episodes"
  ON saved_tv_episodes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved episodes"
  ON saved_tv_episodes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved episodes"
  ON saved_tv_episodes FOR DELETE
  USING (auth.uid() = user_id);

