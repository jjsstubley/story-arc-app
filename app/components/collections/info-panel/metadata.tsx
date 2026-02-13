import { Box } from "@chakra-ui/react";
import ArkHeader from "~/components/ui/ark-header";

import { TmdbCollectionsInterface } from "~/interfaces/tmdb/tmdb-collections";

const CollectionInfoPanelMetadata = ({collection} : { collection: TmdbCollectionsInterface }) => {

    return (
        <>
            <Box display="flex" justifyContent="space-between" gap={4} alignItems="flex-start" width="100%">
                <Box flex={1}>
                    <ArkHeader as="h1"fontSize="lg">
                        {collection.name}
                    </ArkHeader>
                </Box>
                {/* <BsCheck2Circle color="green" size="30px"/> */}  {/* TODO: Add seen status */}
            </Box>
        </>
    );
};

export default CollectionInfoPanelMetadata;