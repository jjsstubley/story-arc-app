import {  Badge, Box, Flex, Heading, SimpleGrid, Text, Button, Breadcrumb, IconButton, HStack } from "@chakra-ui/react";
import '~/styles.css'
import { Link } from "@remix-run/react";
import { getFormattedDate } from "~/utils/helpers";
import { CollectionsInterface } from "~/interfaces/collections";
import MediaImage from "../media/common/movie-image";
import ForkCollectionDialog from "./fork-collection-dialog";
import { getGradientColor } from "~/utils/helpers/gradient-colors";
import BlurredPlaceholder from "../media/common/blurred-placeholder";
import EditCollectionDialog from "./edit-collection-dialog";
import { HiPencil } from "react-icons/hi";
// import BackButton from "../backButton";

const CollectionsHero = ({collection, height = '00px'} : {collection: CollectionsInterface, height?: string}) => {
    const gradientColor = collection ? getGradientColor(collection.id) : "orange.900";

    if (!collection) return (<Box width="100%" height={height} backgroundColor="gray.900" rounded="md"></Box>)
    
    const items = collection.collection_items.slice(0, 4);
    const placeholderCount = Math.max(0, 4 - items.length);
    
    return (
      <Box backgroundColor="transparent" bgGradient="to-b" rounded="md" gradientFrom={gradientColor} gradientTo="transparent" pb={6}>
        <Flex p={4} alignItems="center" justifyContent="space-between" flexWrap="wrap-reverse" gap={4}>
          <Box color="white"  flex={1}>
            <Box mb={4} zIndex={1}>
              {/* <BackButton /> */}
              <Breadcrumb.Root>
                <Breadcrumb.List>
                  <Breadcrumb.Item>
                    Collections
                  </Breadcrumb.Item>
                  <Breadcrumb.Separator />
                  <Breadcrumb.Item>
                    <Breadcrumb.CurrentLink>{collection.name}</Breadcrumb.CurrentLink>
                  </Breadcrumb.Item>
                </Breadcrumb.List>
              </Breadcrumb.Root>
            </Box>
            {/* Text and Data */}
            <HStack gap={4} alignItems="center" mb={2}>
              <Box display="flex" gap={4} alignItems="start" flex={1}>
                <Heading as="h1" lineHeight={1}  size="4xl"  fontWeight={600}>{collection.name}</Heading>
                {collection.is_system_generated && (
                  <ForkCollectionDialog
                    sourceCollection={collection}
                    trigger={<Button>Add Collection</Button>}
                  />
                )}
              </Box>
              {!collection.is_system_generated && (
                <EditCollectionDialog 
                  collection={collection}
                  trigger={
                    <IconButton 
                      variant="subtle" 
                      border="1px solid" 
                      borderColor="whiteAlpha.300" 
                      rounded="full"
                      aria-label="Edit collection"
                      size="sm"
                    >
                      <HiPencil />
                    </IconButton>
                  }
                />
              )}
            </HStack>
            

            <Text mt={4}>{collection.description}</Text>
            <Text mt={4} fontSize="xs">Created { getFormattedDate({release_date: collection.created_at, options: {year: 'numeric', month: 'long',day: 'numeric'}, region:'en-US'}) }</Text>
            <Box display="flex" gap={4} justifyContent="space-between flex-wrap">
              <Box display="flex" gap={2} mt={4} flexWrap="wrap">
                  {
                    collection.tags.map((item, index) => (
                      <Link to={`/keywords/${item.toLowerCase()}`} key={index}>
                        <Badge size="md" colorPalette="orange"> {item} </Badge>
                      </Link>
                    ))
                  }
              </Box>
            </Box>

          </Box>
          <Box rounded="md" overflow="hidden" width="100%" minWidth="300px" maxWidth="300px">
            <SimpleGrid columns={2}>
                {
                  items.map((i, index) => (
                    <MediaImage key={index} backdrop_path={i.movie.backdrop_path} height="100px" />
                  ))
                }
                {
                  Array.from({ length: placeholderCount }).map((_, index) => (
                    <BlurredPlaceholder 
                      key={`placeholder-${index}`} 
                      seed={`${collection.id}-${items.length + index}`}
                      height="100px" 
                    />
                  ))
                }
            </SimpleGrid>
          </Box>
        </Flex>
      </Box>
    );
};

export default CollectionsHero;