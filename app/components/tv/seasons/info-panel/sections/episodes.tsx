

import { TVEpisodeSummaryInterface } from "~/interfaces/tmdb/tv/episode/summary";
import { EpisodePosterlist } from "~/components/tv/episodes/displays/episode-list";

const Episodes= ({episodes, seriesId} : { episodes: TVEpisodeSummaryInterface[], seriesId: number }) => {

    return (
        <EpisodePosterlist items={ episodes.sort((a, b) => new Date(a.air_date).getTime() - new Date(b.air_date).getTime()).filter((item) => item.air_date)} seriesId={seriesId} />
    );
};

export default Episodes;