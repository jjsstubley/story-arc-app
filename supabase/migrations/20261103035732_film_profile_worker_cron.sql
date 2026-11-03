-- Runs the film-profile-worker Edge Function every minute to drain
-- film_profile_jobs. The URL and secret live in Vault, set once per
-- environment (see README, "Film story profiles"):
--   select vault.create_secret('<function url>', 'film_worker_url');
--   select vault.create_secret('<FILM_WORKER_SECRET>', 'film_worker_secret');
-- Until both exist the job selects no rows and makes no request.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

SELECT cron.schedule(
  'film-profile-worker',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := url.decrypted_secret,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || secret.decrypted_secret
    ),
    body := '{}'::jsonb,
    -- pg_net is async, so this doesn't hold up cron; it just waits out a full batch
    timeout_milliseconds := 150000
  )
  FROM vault.decrypted_secrets AS url, vault.decrypted_secrets AS secret
  WHERE url.name = 'film_worker_url' AND secret.name = 'film_worker_secret'
    -- Skip a run while there's nothing to claim (matches claim_film_profile_jobs)
    AND EXISTS (
      SELECT 1 FROM public.film_profile_jobs
      WHERE status = 'pending' OR (status = 'running' AND locked_at < now() - interval '10 minutes')
    )
  $$
);
