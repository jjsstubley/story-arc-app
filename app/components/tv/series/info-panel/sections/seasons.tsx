

import { SeasonPosterlist } from "~/components/tv/seasons/displays/seasons-list";
import { TVSeasonSummaryInterface } from "~/interfaces/tmdb/tv/season/summary";

const Seasons= ({seasons, seriesId} : { seasons: TVSeasonSummaryInterface[], seriesId: number }) => {

    return (
        <SeasonPosterlist items={ seasons.sort((a, b) => new Date(a.air_date).getTime() - new Date(b.air_date).getTime()).filter((item) => item.air_date)} seriesId={seriesId} />
    );
};

export default Seasons;