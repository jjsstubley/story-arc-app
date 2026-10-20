-- Backfill the global watched table from watchlist items marked as seen.
--
-- user_watched_movies is now the single source of truth for whether a user has
-- watched a movie. Older watchlist toggles only set watchlist_items.is_seen,
-- so copy those across. TV series items are excluded: their ids are TMDB series
-- ids and would collide with movie ids.
--
-- Safe to run more than once (existing rows are left untouched).

INSERT INTO user_watched_movies (user_id, tmdb_movie_id)
SELECT DISTINCT w.user_id, COALESCE(wi.tmdb_movie_id, wi.tmdb_id)
FROM watchlist_items wi
JOIN watchlists w ON w.id = wi.watchlist_id
WHERE wi.is_seen = true
  AND COALESCE(wi.media_type, 'movie') = 'movie'
  AND COALESCE(wi.tmdb_movie_id, wi.tmdb_id) IS NOT NULL
ON CONFLICT (user_id, tmdb_movie_id) DO NOTHING;
