import { Box, Button, Flex, Spinner, Text } from "@chakra-ui/react";
import { LuRefreshCw } from "react-icons/lu";
import type { ForYouState } from "../types";

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function timeAgo(iso: string) {
  const minutes = Math.round((Date.parse(iso) - Date.now()) / 60000);
  if (minutes > -60) return relative.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours > -24) return relative.format(hours, "hour");
  return relative.format(Math.round(hours / 24), "day");
}

interface ForYouStatusProps {
  state: ForYouState;
  refreshing: boolean;
  onRefresh: () => void;
}

/** One line saying how fresh the lists are, with a Refresh button */
export function ForYouStatusBar({ state, refreshing, onRefresh }: ForYouStatusProps) {
  const busy = refreshing || state.status === "generating";

  let message: string;
  if (busy) message = state.lists.length ? "Updating your lists to match your latest taste…" : "Making your lists… this takes about half a minute.";
  else if (state.status === "stale" && state.lists.length) message = "Your taste has changed since these lists were made.";
  else if (state.generatedAt) message = `Made ${timeAgo(state.generatedAt)} from your ratings, watch history and preferences.`;
  else message = "Your lists will appear here.";

  return (
    <Flex
      align="center"
      justify="space-between"
      gap={4}
      p={3}
      pl={4}
      rounded="lg"
      bg={state.status === "stale" && !busy ? "orange.900/30" : "blackAlpha.300"}
      border="1px solid"
      borderColor="whiteAlpha.200"
      role="status"
    >
      <Flex align="center" gap={3} minW={0}>
        {busy && <Spinner size="sm" color="orange.400" />}
        <Text fontSize="sm" color="fg.muted">{message}</Text>
      </Flex>
      {!busy && state.status !== "needs-signals" && (
        <Box flexShrink={0}>
          <Button size="xs" variant="outline" onClick={onRefresh}>
            <LuRefreshCw /> Refresh
          </Button>
        </Box>
      )}
    </Flex>
  );
}
