import { Box, Heading, SimpleGrid, Tabs, Text } from "@chakra-ui/react"
import BackButton from "~/components/backButton";
import MoviePoster from "~/components/movie/previews/poster";

import { PersonDetailsInterface } from "~/interfaces/tmdb/people";

import { ImagesInterface } from "~/interfaces/tmdb/images";
import { CreditListInterface } from "~/interfaces/tmdb/credit";
import CreditImage from "~/components/credit/creditImage";
import { getFormattedDate } from "~/utils/helpers";


export default function PersonDetails({ personDetails, images, allCredits }: { personDetails: PersonDetailsInterface, images: ImagesInterface, allCredits: CreditListInterface}) {
  console.log('images', images)
  return (
    <Box position="relative" flex={1} height="100%">
      <Box position="relative" width="100%" height="100%">
        <Box position="absolute" top={5} left={5} zIndex={1}>
          <BackButton />
        </Box>
        <SimpleGrid
            columns={{ base: 1, sm: 1, md: 1, lg: 2, xl: 2 }}
            gap={4}
            alignItems="start"
          > 
          <CreditImage backdrop_path={personDetails.profile_path} size="400px" />
          <Box
       
            width="100%"
         
            color="white"
            p={4}
            px={8}
          >
            {/* Text and Data */}
            <Box display="flex" gap={4} alignItems="end">
              <Heading as="h1" lineHeight={1} letterSpacing="0.225rem" size="4xl" fontFamily="'Epilogue', sans-serif" fontWeight={400}>{personDetails.name}</Heading><small>{personDetails.also_known_as[0]}</small>
            </Box>
            <Text mt={4} lineClamp="3">{personDetails.biography}</Text>
            <Text mt={4}>Born { getFormattedDate({release_date: personDetails.birthday, options: {year: 'numeric', month: 'long',day: 'numeric'}, region:'en-US'})}</Text>

          </Box>
        </SimpleGrid>
      </Box>
      <Box as="section" display="grid" gap={12} gridColumn={1} flex="1" overflow="hidden" mt={4} mx={8}>
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