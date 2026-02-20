import { Badge, Box, Text } from "@chakra-ui/react";
import { getFormattedDate, getMovieTags } from "~/utils/helpers";
import ArkHeader from "~/components/ui/ark-header";

import { TmdbTVSeriesDetailWAppendsProps } from "~/interfaces/tmdb/tv/series/details";
import Genres from "~/components/media/common/genres";

const InfoPanelMetadata = ({series} : { series: TmdbTVSeriesDetailWAppendsProps }) => {

    return (
        <>
            <Box display="flex" justifyContent="space-between" gap={4} alignItems="flex-start" width="100%">
                <Box flex={1}>
                    <ArkHeader as="h1"fontSize="lg">
                        {series.name} <Text fontSize="xs" color="whiteAlpha.600" whiteSpace="nowrap">{ getFormattedDate({release_date: series.first_air_date, options: {year: 'numeric', month: 'long',day: 'numeric'}, region:'en-US'}) } | { series.number_of_seasons} seasons</Text> 
                    </ArkHeader>
                </Box>
                {/* <BsCheck2Circle color="green" size="30px"/> */}  {/* TODO: Add seen status */}
            </Box>
            <Box display="flex" gap={2} mt={4} flexWrap="wrap">
                <Genres genres={series.genres} />
            </Box>
            <Box display="flex" gap={2} alignItems="center" justifyContent="flex-start">
                {
                    getMovieTags(series, {minimumVotes: 100, globalAverageRating: 6.8 }).map((tag, index) => ( 
                        <Badge key={index} size="md" colorPalette="red" mt={4}> {tag} </Badge>
                    ))
                }
            </Box>
        </>
    );
};

export default InfoPanelMetadata;