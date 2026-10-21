-- Create ai_queries table
CREATE TABLE IF NOT EXISTS ai_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  prompt TEXT NOT NULL,
  context JSONB,
  generated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create ai_recommendations table
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  movie_id INTEGER NOT NULL,
  ai_query_id UUID NOT NULL REFERENCES ai_queries(id) ON DELETE CASCADE,
  context_tags JSONB,
  reasoning TEXT
);

-- Enable pg_trgm extension for fuzzy text matching (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create indexes for ai_queries
CREATE INDEX IF NOT EXISTS idx_ai_queries_generated_by ON ai_queries(generated_by);
CREATE INDEX IF NOT EXISTS idx_ai_queries_created_at ON ai_queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_queries_prompt_trgm ON ai_queries USING gin(prompt gin_trgm_ops);

-- Create indexes for ai_recommendations
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_ai_query_id ON ai_recommendations(ai_query_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_movie_id ON ai_recommendations(movie_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_created_at ON ai_recommendations(created_at DESC);

-- Enable RLS
ALTER TABLE ai_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_queries
CREATE POLICY "Users can view their own ai queries"
  ON ai_queries FOR SELECT
  USING (auth.uid() = generated_by);

CREATE POLICY "Users can insert their own ai queries"
  ON ai_queries FOR INSERT
  WITH CHECK (auth.uid() = generated_by);

CREATE POLICY "Users can update their own ai queries"
  ON ai_queries FOR UPDATE
  USING (auth.uid() = generated_by);

CREATE POLICY "Users can delete their own ai queries"
  ON ai_queries FOR DELETE
  USING (auth.uid() = generated_by);

-- RLS Policies for ai_recommendations
-- Users can only access recommendations linked to their own queries
CREATE POLICY "Users can view recommendations for their queries"
  ON ai_recommendations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ai_queries
      WHERE ai_queries.id = ai_recommendations.ai_query_id
      AND ai_queries.generated_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert recommendations for their queries"
  ON ai_recommendations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_queries
      WHERE ai_queries.id = ai_recommendations.ai_query_id
      AND ai_queries.generated_by = auth.uid()
    )
  );

CREATE POLICY "Users can update recommendations for their queries"
  ON ai_recommendations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM ai_queries
      WHERE ai_queries.id = ai_recommendations.ai_query_id
      AND ai_queries.generated_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete recommendations for their queries"
  ON ai_recommendations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM ai_queries
      WHERE ai_queries.id = ai_recommendations.ai_query_id
      AND ai_queries.generated_by = auth.uid()
    )
  );

