export const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';

export const TMDB_API_OPTIONS = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${process.env.VITE_TMDB_ACCESS_TOKEN}`,
    }
};