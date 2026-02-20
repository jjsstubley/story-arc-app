-- Fix ai_recommendations table column types
-- This ensures movie_id is INTEGER and ai_query_id is UUID

-- First, check current types (run this to verify)
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'ai_recommendations';

-- Backup existing data if needed (uncomment if you have data to preserve)
-- CREATE TABLE IF EXISTS ai_recommendations_backup AS SELECT * FROM ai_recommendations;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view recommendations for their queries" ON ai_recommendations;
DROP POLICY IF EXISTS "Users can insert recommendations for their queries" ON ai_recommendations;
DROP POLICY IF EXISTS "Users can update recommendations for their queries" ON ai_recommendations;
DROP POLICY IF EXISTS "Users can delete recommendations for their queries" ON ai_recommendations;

-- Drop indexes
DROP INDEX IF EXISTS idx_ai_recommendations_ai_query_id;
DROP INDEX IF EXISTS idx_ai_recommendations_movie_id;
DROP INDEX IF EXISTS idx_ai_recommendations_created_at;

-- Drop the table (this will also drop the foreign key constraint)
DROP TABLE IF EXISTS ai_recommendations CASCADE;

-- Recreate with correct types
CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  movie_id INTEGER NOT NULL,
  ai_query_id UUID NOT NULL REFERENCES ai_queries(id) ON DELETE CASCADE,
  context_tags JSONB,
  reasoning TEXT
);

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_ai_query_id ON ai_recommendations(ai_query_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_movie_id ON ai_recommendations(movie_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_created_at ON ai_recommendations(created_at DESC);

-- Re-enable RLS
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
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
  )
  WITH CHECK (
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

