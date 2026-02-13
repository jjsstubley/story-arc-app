import { Box, Heading, SimpleGrid, Tabs, Text } from "@chakra-ui/react"
import MoviePoster from "~/components/movie/previews/poster";

import { PersonDetailsInterface } from "~/interfaces/tmdb/people/details";

import { ImagesInterface } from "~/interfaces/tmdb/images";
import { CreditListInterface } from "~/interfaces/tmdb/people/credit";
import CreditImage from "~/components/credit/creditImage";
import { getFormattedDate } from "~/utils/helpers";


export default function PersonDetails({ personDetails, images, allCredits }: { personDetails: PersonDetailsInterface, images: ImagesInterface, allCredits: CreditListInterface}) {
  console.log('images', images)
  return (
    <Box position="relative" flex={1} overflow="auto" height="calc(100vh - 100px)">
      <Box position="relative" width="100%" mb={4} backgroundColor="transparent" bgGradient="to-b" rounded="md" gradientFrom="orange.900" gradientTo="transparent">
        {/* <Box position="absolute" top={5} left={5} zIndex={1}>
          <BackButton />
        </Box> */}
        <SimpleGrid
            columns={{ base: 1, sm: 1, md: 1, lg: 3, xl: 3 }}
            gap={4}
            alignItems="start"
            p={4}
          > 
          <CreditImage backdrop_path={personDetails.profile_path} />
          <Box
            gridColumn="span 2 / span 2"
            width="100%"
         
            color="white"
            p={4}
            px={8}
          >
            {/* Text and Data */}
            <Box display="flex" gap={4} alignItems="end">
              <Heading 
                  as="h1"
                  fontSize="lg" 
                  fontWeight="bold" 
                  fontFamily="'Epilogue', sans-serif"
                  letterSpacing="widest"
                  textTransform="uppercase"
                  color="white"
                  textShadow="2px 2px 4px rgba(0,0,0,0.7)"
                  borderLeft="4px solid"
                  borderColor="orange.400"
                  pl={3}
                  >
                  {personDetails.name} <small>{personDetails.also_known_as[0]}</small> 
              </Heading>
            </Box>
            <Text mt={4} lineClamp="3">{personDetails.biography}</Text>
            <Text mt={4}>Born { getFormattedDate({release_date: personDetails.birthday, options: {year: 'numeric', month: 'long',day: 'numeric'}, region:'en-US'})}</Text>

          </Box>
        </SimpleGrid>
      </Box>
      <Box as="section" display="grid" gap={12} gridColumn={1} flex="1" overflow="hidden"  mx={8}>
        {/* Use infinite scroll to load more movie options here */}
      <Tabs.Root defaultValue="starred" variant="plain">
          <Tabs.List bg="bg.muted" rounded="l3" p="1">
            <Tabs.Trigger value="starred">
              Starred
            </Tabs.Trigger>
            <Tabs.Trigger value="credit">
        
              Credit
            </Tabs.Trigger>
            <Tabs.Indicator rounded="l2" />
          </Tabs.List>
          <Tabs.Content value="starred">
            <Box as="section" flex="1" overflow="hidden">
              <SimpleGrid
                columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
                gap={4}
                mt={4}
                alignContent="start"
                >
                  {
                    allCredits.cast.map((item, i) => (
                      <MoviePoster key={i} item={item}/>
                    ))
                  }
              </SimpleGrid>
            </Box> 
          </Tabs.Content>
          <Tabs.Content value="credit">
            <Box as="section" flex="1" overflow="hidden">
              <SimpleGrid
                  columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
                  gap={4}
                  mt={4}
                  alignItems={"start"}
                  >
                    {
                      allCredits.crew.map((item, i) => (
                        <MoviePoster key={i} item={item}/>
                      ))
                    }
              </SimpleGrid>
            </Box> 
          </Tabs.Content>

        </Tabs.Root>

      </Box>
    </Box>
  );
}