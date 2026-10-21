-- Make fuzzy matching of AI queries work, and stop find_similar_queries bypassing RLS.
--
-- find_similar_queries has always errored, because pg_trgm (which provides similarity())
-- was never enabled. The app silently fell back to an ILIKE search. It was also
-- SECURITY DEFINER and filtered on the caller-supplied user_id, so enabling pg_trgm
-- alone would have let anyone read any user's prompts. Both are fixed here together.

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- SECURITY INVOKER: runs as the caller, so the ai_queries RLS policies apply.
-- LANGUAGE sql avoids PL/pgSQL's ambiguity between output columns and table columns.
CREATE OR REPLACE FUNCTION public.find_similar_queries(
  search_prompt text,
  user_id uuid,
  similarity_threshold real DEFAULT 0.3
)
RETURNS TABLE (
  id uuid,
  created_at timestamp with time zone,
  prompt text,
  context jsonb,
  generated_by uuid,
  similarity real
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT
    aq.id,
    aq.created_at,
    aq.prompt,
    aq.context,
    aq.generated_by,
    extensions.similarity(aq.prompt, search_prompt) AS similarity
  FROM public.ai_queries aq
  WHERE aq.generated_by = find_similar_queries.user_id
    AND extensions.similarity(aq.prompt, search_prompt) >= similarity_threshold
  ORDER BY 6 DESC, aq.created_at DESC
  LIMIT 1;
$$;

-- Functions are executable by PUBLIC by default; only signed-in users need it.
REVOKE EXECUTE ON FUNCTION public.find_similar_queries(text, uuid, real) FROM PUBLIC, anon;

-- Queries are always looked up per user, newest first.
CREATE INDEX IF NOT EXISTS idx_ai_queries_generated_by_created_at
  ON public.ai_queries (generated_by, created_at DESC);

-- Fails (and the whole migration rolls back) if any query belongs to a deleted user.
ALTER TABLE public.ai_queries
  ADD CONSTRAINT ai_queries_generated_by_fkey
  FOREIGN KEY (generated_by) REFERENCES auth.users (id) ON DELETE CASCADE;
