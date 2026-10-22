import { Box, Button, Flex, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { useAutoRefreshForYou, useForYou } from "../queries";
import type { ForYouState, TastePreferences } from "../types";
import { ForYouListRows, ForYouListsSkeleton } from "./for-you-lists";
import { ForYouStatusBar } from "./for-you-status";
import PreferencesEditor from "./preferences-editor";
import TasteProfileCard from "./taste-profile-card";

interface ForYouPageProps {
  initialState: ForYouState;
  initialPreferences: TastePreferences;
  genres: { id: number; name: string }[];
}

/** The user's taste profile, their preferences, and the lists made from them */
export default function ForYouPage({ initialState, initialPreferences, genres }: ForYouPageProps) {
  const { data: state = initialState } = useForYou({ initialData: initialState });
  const refresh = useAutoRefreshForYou(state);
  const busy = refresh.isPending || state.status === "generating";

  return (
    <Box>
      <Box position="relative" overflow="hidden" px={{ base: 5, md: 8 }} pt={{ base: 10, md: 16 }} pb={8}>
        <Box position="absolute" inset={0} bgGradient="to-br" gradientFrom="orange.900/60" gradientVia="purple.900/30" gradientTo="transparent" />
        <Box position="absolute" left={0} top={0} bottom={0} width="4px" bg="orange.400" />
        <Box position="relative">
          <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="0.3em" color="orange.400" mb={2}>
            Made for you
          </Text>
          <Heading as="h1" fontSize={{ base: "4xl", md: "6xl" }} fontWeight="light" letterSpacing="0.06em" lineHeight="1.05">
            Your taste
          </Heading>
          <Text mt={4} color="whiteAlpha.800" maxW="60ch">
            Built from what you rate, favourite, watch and save, plus anything you tell us below. Your lists update
            when your taste changes, at most once a day.
          </Text>
        </Box>
      </Box>

      <Flex direction="column" gap={10} px={{ base: 4, md: 8 }} pb={10}>
        <SimpleGrid columns={{ base: 1, xl: 2 }} gap={6} alignItems="start">
          <TasteProfileCard profile={state.profile} />
          <PreferencesEditor initialPreferences={initialPreferences} genres={genres} />
        </SimpleGrid>

        {state.status === "needs-signals" && state.lists.length === 0 ? (
          <Box p={6} rounded="lg" border="1px dashed" borderColor="whiteAlpha.300" textAlign="center">
            <Heading as="h2" size="md" fontWeight="light" mb={2}>Your lists are waiting for a few clues</Heading>
            <Text fontSize="sm" color="fg.muted" mb={4}>
              Rate, favourite or mark at least three films as watched, or save some preferences above.
            </Text>
            <Link to="/">
              <Button size="sm" variant="outline">Find films to rate</Button>
            </Link>
          </Box>
        ) : (
          <Flex direction="column" gap={10}>
            <ForYouStatusBar state={state} refreshing={refresh.isPending} onRefresh={() => refresh.mutate(true)} />
            {state.lists.length > 0 ? <ForYouListRows lists={state.lists} /> : busy && <ForYouListsSkeleton />}
          </Flex>
        )}
      </Flex>
    </Box>
  );
}
