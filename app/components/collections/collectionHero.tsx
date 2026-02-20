import {  Badge, Box, Flex, Heading, SimpleGrid, Text, Button, Breadcrumb, IconButton, HStack, Image } from "@chakra-ui/react";
import '~/styles.css'
import { Link } from "@remix-run/react";
import { getFormattedDate } from "~/utils/helpers";
import { CollectionsInterface } from "~/interfaces/collections";
import MediaImage from "../media/common/movie-image";
import ForkCollectionDialog from "./fork-collection-dialog";
import { usePosterGradientColor } from "~/hooks/use-poster-gradient-color";
import BlurredPlaceholder from "../media/common/blurred-placeholder";
import EditCollectionDialog from "./edit-collection-dialog";
import { HiPencil } from "react-icons/hi";
import { LuChevronUp } from "react-icons/lu";
import { Session } from "@supabase/supabase-js";
import { forwardRef, useState, useRef, useEffect } from "react";
// import BackButton from "../backButton";

interface CollectionsHeroProps {
  collection: CollectionsInterface;
  height?: string;
  session?: Session | null;
}

const CollectionsHero = forwardRef<HTMLHeadingElement, CollectionsHeroProps>(({collection, height = '00px', session}, ref) => {
    const firstMovie = collection?.collection_items?.[0];
    const gradientColor = usePosterGradientColor(
      firstMovie?.movie?.id,
      firstMovie?.movie?.poster_path,
      collection?.id
    );

    // Tags expand/collapse state
    const [isTagsExpanded, setIsTagsExpanded] = useState(false);
    const [visibleTagCount, setVisibleTagCount] = useState(collection?.tags.length || 0);
    const tagsContainerRef = useRef<HTMLDivElement>(null);
    const badgeRefs = useRef<(HTMLAnchorElement | null)[]>([]);

    // Measure which badges fit in 3 rows
    useEffect(() => {
      if (!tagsContainerRef.current || !collection || collection.tags.length === 0) {
        setVisibleTagCount(collection?.tags.length || 0);
        return;
      }

      // Reset refs array
      badgeRefs.current = new Array(collection.tags.length).fill(null);

      // Wait for badges to render
      const timeoutId = setTimeout(() => {
        const container = tagsContainerRef.current;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        let lastRowTop = -1;
        let currentRow = 1;
        let countInFirst3Rows = 0;

        badgeRefs.current.forEach((badgeRef) => {
          if (!badgeRef) return;

          const rect = badgeRef.getBoundingClientRect();
          const top = rect.top - containerRect.top;

          // Determine if this is a new row
          if (lastRowTop === -1 || Math.abs(top - lastRowTop) > 5) {
            if (lastRowTop !== -1) {
              currentRow++;
            }
            lastRowTop = top;
          }

          // Count badges in first 3 rows
          if (currentRow <= 3) {
            countInFirst3Rows++;
          }
        });

        // If all tags fit in 3 rows, show all
        if (countInFirst3Rows >= collection.tags.length) {
          setVisibleTagCount(collection.tags.length);
        } else {
          // Show tags that fit in 3 rows (minus 1 to make room for "+X more" badge)
          setVisibleTagCount(Math.max(0, countInFirst3Rows - 1));
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }, [collection]);

    if (!collection) return (<Box width="100%" height={height} backgroundColor="gray.900" rounded="md"></Box>)
    
    const items = collection.collection_items.slice(0, 4);
    const placeholderCount = Math.max(0, 4 - items.length);
    
    const hasMoreTags = !isTagsExpanded && visibleTagCount < (collection?.tags.length || 0);
    const remainingCount = (collection?.tags.length || 0) - visibleTagCount;
    const tagsToShow = isTagsExpanded 
      ? collection.tags 
      : collection.tags.slice(0, visibleTagCount);
    
    return (
      <Box position="relative" rounded="md" overflow="hidden">
        {/* Background image layer - subtle, centered */}
        {firstMovie && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={0}
            opacity={0.25}
            display="flex"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
          >
            <Image
              src={`https://image.tmdb.org/t/p/original/${firstMovie.movie.backdrop_path}`}
              width="100%"
              height="100%"
              objectFit="cover"
              objectPosition="center"
              filter="blur(10px) brightness(0.8)"
              transform="scale(1.1)"
            />
          </Box>
        )}

        {/* Gradient overlay */}
        <Box 
          position="relative"
          zIndex={1}
          backgroundColor="transparent" 
          bgGradient="to-b" 
          gradientFrom={gradientColor} 
          gradientTo="transparent" 
          pb={6}
        >
          <Flex p={4} alignItems="center" justifyContent="space-between" flexWrap="wrap-reverse" gap={4}>
            <Box color="white" flex={1} position="relative" zIndex={2}>
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
                  <Heading ref={ref} as="h1" lineHeight={1}  size="4xl"  fontWeight={600}>{collection.name}</Heading>
                  {collection.is_system_generated && session && (
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
                <Box position="relative" flex={1}>
                  <Box 
                    ref={tagsContainerRef}
                    display="flex" 
                    gap={2} 
                    mt={4} 
                    flexWrap="wrap"
                  >
                    {
                      collection.tags.map((item, index) => {
                        const isVisible = index < tagsToShow.length;
                        return (
                          <Link 
                            to={`/keywords/${item.toLowerCase()}`} 
                            key={index} 
                            style={{ 
                              textDecoration: 'none',
                              display: isVisible ? 'inline-block' : 'none'
                            }}
                            ref={(el) => {
                              badgeRefs.current[index] = el;
                            }}
                          >
                            <Badge size="md" colorPalette="orange"> {item} </Badge>
                          </Link>
                        );
                      })
                    }
                    {hasMoreTags && (
                      <Badge 
                        size="md" 
                        colorPalette="orange"
                        as="button"
                        onClick={() => setIsTagsExpanded(true)}
                        cursor="pointer"
                        style={{ textDecoration: 'none', border: 'none', background: 'inherit' }}
                      >
                        +{remainingCount} more
                      </Badge>
                    )}
                  </Box>
                  {isTagsExpanded && (
                    <IconButton
                      size="sm"
                      variant="ghost"
                      colorPalette="orange"
                      mt={2}
                      onClick={() => setIsTagsExpanded(false)}
                      aria-label="Collapse tags"
                    >
                      <LuChevronUp />
                    </IconButton>
                  )}
                </Box>
              </Box>
            </Box>
            <Box rounded="md" overflow="hidden" width="100%" minWidth="300px" maxWidth="300px" position="relative" zIndex={2}>
              <SimpleGrid columns={2} gap={0} alignItems="flex-start">
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
      </Box>
    );
});

CollectionsHero.displayName = 'CollectionsHero';

export default CollectionsHero;