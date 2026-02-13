import {  Badge, Box, Flex, Heading, SimpleGrid, Text, Button, Breadcrumb } from "@chakra-ui/react";
import '~/styles.css'
import { Link } from "@remix-run/react";
import { getFormattedDate } from "~/utils/helpers";
import { CollectionsInterface } from "~/interfaces/collections";
import MediaImage from "../media/common/movie-image";
import ForkCollectionDialog from "./fork-collection-dialog";
// import BackButton from "../backButton";

const CollectionsHero = ({collection, height = '00px'} : {collection: CollectionsInterface, height?: string}) => {

    if (!collection) return (<Box width="100%" height={height} backgroundColor="gray.900" rounded="md"></Box>)
    return (
      <Box backgroundColor="transparent" bgGradient="to-b" rounded="md" gradientFrom="orange.900" gradientTo="transparent" pb={6}>
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
            <Box display="flex" gap={4} alignItems="center" >
              <Box display="flex" gap={4} alignItems="start">
                <Heading as="h1" lineHeight={1}  size="4xl"  fontWeight={600}>{collection.name}</Heading>
                {/* <small>{movie.runtime} mins</small> */}
                {collection.is_system_generated && (
                  <ForkCollectionDialog
                    sourceCollection={collection}
                    trigger={<Button>Add Collection</Button>}
                  />
                )}
              </Box>
              {/* <WatchListDropdown movieId={movie.id}/> */}
              {/* This shows up only once user have mark as seen */}
              {/* <IconButton variant="subtle" border="1px solid" borderColor={"whiteAlpha.300"} rounded="full" onClick={() => setIsFavourite((prev) => !prev)}>
                  {isFavourite ? (<Text color="red"><GoHeartFill size={28}/></Text>) : (<Text><GoHeart size={28}/></Text>) }
              </IconButton> */}
            </Box>
            

            <Text mt={4}>{collection.description}</Text>
            <Text mt={4} fontSize="xs">Created { getFormattedDate({release_date: collection.created_at, options: {year: 'numeric', month: 'long',day: 'numeric'}, region:'en-US'}) }</Text>
            <Box display="flex" gap={4} justifyContent="space-between">
              <Box display="flex" gap={2} mt={4}>
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
                  collection.collection_items.slice(0,4).map((i, index) => (
                    <MediaImage key={index} backdrop_path={i.movie.backdrop_path} height="100px" />
                  ))
                }
            </SimpleGrid>
          </Box>
        </Flex>
      </Box>
    );
};

export default CollectionsHero;