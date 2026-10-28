import { Box, Button, CloseButton, Flex, Text } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { LuArrowRight, LuSparkles } from "react-icons/lu";
import { useAutoRefreshForYou, useForYou, useSaveTastePreferences } from "../queries";
import { TASTE_PATH, setupPath } from "../paths";
import type { ForYouState } from "../types";
import { ForYouListRows, ForYouListsSkeleton } from "./for-you-lists";

function PromptCard({ title, body, to, action, onDismiss }: { title: string; body: string; to: string; action: string; onDismiss?: () => void }) {
  return (
    <Flex
      position="relative"
      align={{ base: "flex-start", md: "center" }}
      direction={{ base: "column", md: "row" }}
      justify="space-between"
      gap={4}
      p={5}
      pr={onDismiss ? 12 : 5}
      rounded="lg"
      bgGradient="to-r"
      gradientFrom="orange.900/40"
      gradientTo="purple.900/30"
      border="1px solid"
      borderColor="whiteAlpha.200"
    >
      <Flex gap={3} align="center">
        <LuSparkles size={22} color="var(--chakra-colors-orange-400)" style={{ flexShrink: 0 }} />
        <Box>
          <Text fontWeight="semibold">{title}</Text>
          <Text fontSize="sm" color="fg.muted">{body}</Text>
        </Box>
      </Flex>
      <Link to={to}>
        <Button size="sm" colorPalette="orange">{action}</Button>
      </Link>
      {onDismiss && (
        <CloseButton size="sm" position="absolute" top={2} right={2} aria-label="Do it later" onClick={onDismiss} />
      )}
    </Flex>
  );
}

function emptyStatePrompt(state: ForYouState) {
  if (state.setup !== "done") {
    return {
      title: "Lists made for you",
      body: "Tell us what kinds of stories you love and we'll make you personal lists. It takes about two minutes.",
      to: setupPath("/"),
      action: "Set up your taste",
    };
  }
  return {
    title: "Lists made for you",
    body: state.status === "needs-signals"
      ? "Rate or watch a few films, or tell us what you like, and we'll make you personal lists."
      : "See what we think you'll love, and fine-tune it.",
    to: TASTE_PATH,
    action: "See your taste",
  };
}

/** "Made for you" rows near the top of the home page, for signed-in users */
export default function ForYouHomeRow() {
  const { data: state, isPending, isError } = useForYou();
  const refresh = useAutoRefreshForYou(state);
  const save = useSaveTastePreferences();

  if (isPending) return <ForYouListsSkeleton rows={1} />;
  // The rest of the home page works without it, so fail quietly
  if (isError) return null;

  // Users who haven't set up (including everyone from before the setup existed) see this until they finish or dismiss it
  const setupCard = state.setup === "needed" && (
    <PromptCard
      title="New: tell us what kinds of stories you love"
      body="A few quick picks (endings, pacing, arcs, directors) to make your lists and suggestions fit you better."
      to={setupPath("/")}
      action="Set up your taste"
      onDismiss={() => save.mutate({ onboarding: "skipped" })}
    />
  );

  if (state.lists.length > 0) {
    return (
      <Flex direction="column" gap={6}>
        {setupCard}
        {state.setup === "skipped" && (
          <Link to={setupPath("/")}>
            <Flex align="center" gap={1} fontSize="sm" color="orange.300" _hover={{ color: "orange.200" }}>
              Finish setting up your taste <LuArrowRight />
            </Flex>
          </Link>
        )}
        <ForYouListRows lists={state.lists} />
      </Flex>
    );
  }

  if (refresh.isPending || state.status === "generating") {
    return (
      <Box>
        <Text fontSize="sm" color="fg.muted" mb={4}>Making your first lists…</Text>
        <ForYouListsSkeleton rows={1} />
      </Box>
    );
  }

  return setupCard || <PromptCard {...emptyStatePrompt(state)} />;
}
