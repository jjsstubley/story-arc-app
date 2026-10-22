import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { LuSparkles } from "react-icons/lu";
import { useAutoRefreshForYou, useForYou } from "../queries";
import { ForYouListRows, ForYouListsSkeleton } from "./for-you-lists";

/** "Made for you" rows near the top of the home page, for signed-in users */
export default function ForYouHomeRow() {
  const { data: state, isPending, isError } = useForYou();
  const refresh = useAutoRefreshForYou(state);

  if (isPending) return <ForYouListsSkeleton rows={1} />;
  // The rest of the home page works without it, so fail quietly
  if (isError) return null;

  if (state.lists.length > 0) return <ForYouListRows lists={state.lists} />;

  if (refresh.isPending || state.status === "generating") {
    return (
      <Box>
        <Text fontSize="sm" color="fg.muted" mb={4}>Making your first lists…</Text>
        <ForYouListsSkeleton rows={1} />
      </Box>
    );
  }

  return (
    <Flex
      align={{ base: "flex-start", md: "center" }}
      direction={{ base: "column", md: "row" }}
      justify="space-between"
      gap={4}
      p={5}
      rounded="lg"
      bgGradient="to-r"
      gradientFrom="orange.900/40"
      gradientTo="purple.900/30"
      border="1px solid"
      borderColor="whiteAlpha.200"
    >
      <Flex gap={3} align="center">
        <LuSparkles size={22} color="var(--chakra-colors-orange-400)" />
        <Box>
          <Text fontWeight="semibold">Lists made for you</Text>
          <Text fontSize="sm" color="fg.muted">
            {state.status === "needs-signals"
              ? "Rate or watch a few films, or tell us what you like, and we'll make you personal lists."
              : "See what we think you'll love, and fine-tune it."}
          </Text>
        </Box>
      </Flex>
      <Link to="/for-you">
        <Button size="sm" colorPalette="orange">Set up your taste</Button>
      </Link>
    </Flex>
  );
}
