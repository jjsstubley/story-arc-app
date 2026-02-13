
import { Box } from '@chakra-ui/react';
import { MediaItem, useMediaPanel } from '~/components/providers/media-provider';
import { TmdbCollectionsInterface } from '~/interfaces/tmdb/tmdb-collections';

const CollectionPanelTrigger = ({item, children} : { item: TmdbCollectionsInterface, children: React.ReactNode; }) => {
    const { openPanel } = useMediaPanel();

    async function getCollectionDetails() {
        const res = await fetch(`/api/collections/${item.id}`)
        const data = await res.json()

        console.log('CollectionPanelTrigger data', data)

        const mediaItem = {
            type: 'collection',
            data: data.collection as TmdbCollectionsInterface
        }

        openPanel(mediaItem as MediaItem)
    }


    return (
        <Box onClick={getCollectionDetails}>
            {children}
        </Box>
    );
};

export default CollectionPanelTrigger;