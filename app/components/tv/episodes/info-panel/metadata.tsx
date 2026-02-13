import { Box, Text } from "@chakra-ui/react";
import { getFormattedDate } from "~/utils/helpers";
import ArkHeader from "~/components/ui/ark-header";

import { TVEpisodeDetailsInterface } from "~/interfaces/tmdb/tv/episode/details";

const InfoPanelMetadata = ({episode} : { episode: TVEpisodeDetailsInterface }) => {

    return (
        <>
            <Box display="flex" justifyContent="space-between" gap={4} alignItems="flex-start" width="100%">
                <Box flex={1}>
                    <ArkHeader as="h1"fontSize="lg">
                        {episode.name} <Text fontSize="xs" color="whiteAlpha.600" whiteSpace="nowrap">{ getFormattedDate({release_date: episode.air_date, options: {year: 'numeric', month: 'long',day: 'numeric'}, region:'en-US'}) }</Text> 
                    </ArkHeader>
                </Box>
                {/* <BsCheck2Circle color="green" size="30px"/> */}  {/* TODO: Add seen status */}
            </Box>
        </>
    );
};

export default InfoPanelMetadata;