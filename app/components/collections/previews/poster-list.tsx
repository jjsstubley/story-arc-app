import { Box, Text } from '@chakra-ui/react';
import { TmdbCollectionsInterface } from '~/interfaces/tmdb/tmdb-collections';
import BasePoster from '~/components/ui/base-poster';
import MediaTriggerWrapper from '~/components/media/media-trigger-wrapper';

const CollectionPosterList = ({item } : { item: TmdbCollectionsInterface }) => {

    const poster = (
        <>
            <Box display="flex" gap={2} alignItems="center">
                <Box width={10}><BasePoster file={item.poster_path} title={item.name} aspectRatio={1 / 1} /></Box>
                <Box width="100%" color="white" textAlign="left">
                    <Text fontSize="xs" color="whiteAlpha.600">{item.name}</Text>
                </Box>

            </Box>
        </>
    );

    return (
        <MediaTriggerWrapper media={{ type: 'collection', data: item }}>
            {poster}
        </MediaTriggerWrapper>
    );
};

export default CollectionPosterList;