
import MoviePosterList from "~/components/movie/previews/poster-list";

import { TmdbMovieSummaryInterface } from "~/interfaces/tmdb/movie/summary";

const Parts= ({parts} : { parts: TmdbMovieSummaryInterface[] }) => {

    return (
        <>
            {
                parts.sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime()).filter((item) => item.release_date).map((item, index) => (
                    <MoviePosterList item={item} key={index} />
                ))
            }
        </>
    );
};

export default Parts;