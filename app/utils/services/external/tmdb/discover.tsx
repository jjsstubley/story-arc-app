import { TMDB_API_BASE_URL, TMDB_API_OPTIONS } from "./config";

const SEGMENT_ENDPOINT = '/discover'

interface payloadProps {
    type: string,
    value: string,
}

const defaultSort = 'popularity.dec'

const defaultParams = {
    include_adult: 'false',
    include_video: 'false',
    language: 'en-US',
    watch_region: 'AU'
};

export async function getMoviesByAdvancedFilters({ payload, page, sort=defaultSort, provider }: { payload: payloadProps[], page: string, sort?: string, provider?: string }) {

    const params = new URLSearchParams({
        ...defaultParams,
        page: page,
        sort_by: sort,
    });

    console.log('getMoviesByAdvancedFilters payload', payload)

    payload.forEach((i) => {
        params.append(i.type, i.value)
    })

    if (provider) {
        params.append('with_watch_providers', provider)
    }
      
    const url = `${TMDB_API_BASE_URL}${SEGMENT_ENDPOINT}/movie?${params.toString()}`;
    
    try {
        const res = await fetch(url, TMDB_API_OPTIONS)
        return res.json()
    } catch (err) {
        console.error(err)
        return []
    }
    
}

export async function getMoviesByGenre({ genre, page=1, sort=defaultSort }: { genre: number, page?: number, sort?: string }) {
    return await getMoviesByAdvancedFilters({payload: [{type: 'with_genres', value: genre.toString()}], page: page.toString(), sort: sort})
}

export async function getMoviesByKeyword({ keyword, page=1, sort=defaultSort }: { keyword: number, page?: number, sort?: string }) {
  return await getMoviesByAdvancedFilters({payload: [{type: 'with_keywords', value: keyword.toString()}], page: page.toString(), sort: sort})
}