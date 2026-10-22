
import { Box } from '@chakra-ui/react';
import { useMediaPanel } from '~/components/providers/media-provider';
import { apiFetch } from '~/shared/api/client';
import { TmdbCollectionsInterface } from '~/interfaces/tmdb/tmdb-collections';

const CollectionPanelTrigger = ({item, children} : { item: TmdbCollectionsInterface, children: React.ReactNode; }) => {
    const { openPanel } = useMediaPanel();

    async function getCollectionDetails() {
        const collection = await apiFetch<TmdbCollectionsInterface>(`/api/tmdb-collections/${item.id}`)
        openPanel({ type: 'collection', data: collection })
    }


    return (
        <Box onClick={getCollectionDetails}>
            {children}
        </Box>
    );
};

export default CollectionPanelTrigger;