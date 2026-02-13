import { Box, Text } from "@chakra-ui/react";
import { getFormattedDate } from "~/utils/helpers";
import ArkHeader from "~/components/ui/ark-header";

import { TVSeasonDetailsInterface } from "~/interfaces/tmdb/tv/season/details";

const InfoPanelMetadata = ({season} : { season: TVSeasonDetailsInterface }) => {

    return (
        <>
            <Box display="flex" justifyContent="space-between" gap={4} alignItems="flex-start" width="100%">
                <Box flex={1}>
                    <ArkHeader as="h1"fontSize="lg">
                        {season.name} <Text fontSize="xs" color="whiteAlpha.600" whiteSpace="nowrap">{ getFormattedDate({release_date: season.air_date, options: {year: 'numeric', month: 'long',day: 'numeric'}, region:'en-US'}) } | { season.episodes.length } episodes</Text> 
                    </ArkHeader>
                </Box>
                {/* <BsCheck2Circle color="green" size="30px"/> */}  {/* TODO: Add seen status */}
            </Box>
        </>
    );
};

export default InfoPanelMetadata;