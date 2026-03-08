import { Badge, Box, Flex, Heading, IconButton, Text } from "@chakra-ui/react";
import { WatchlistInterface } from "~/interfaces/watchlist";
import EditWatchlistDialog from "./edit-watchlist-dialog";
import { HiPencil } from "react-icons/hi";

interface FixedWatchlistHeaderProps {
  watchlist: WatchlistInterface;
  gradientColor: string;
}

export default function FixedWatchlistHeader({
  watchlist,
  gradientColor,
}: FixedWatchlistHeaderProps) {
  const items = watchlist.watchlist_items ?? [];
  const total = items.length;
  const seenCount = items.filter((i) => i.is_seen).length;
  const isComplete = total > 0 && seenCount === total;

  return (
    <Box
      position="sticky"
      top={0}
      left={0}
      right={0}
      zIndex={100}
      borderBottom="1px solid"
      borderColor="whiteAlpha.200"
      backdropFilter="blur(10px)"
      transition="opacity 0.3s ease-in-out, transform 0.3s ease-in-out"
      overflow="hidden"
      opacity={1}
      transform="translateY(0)"
    >
      {/* Gradient background */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient="to-r"
        gradientFrom={gradientColor}
        gradientTo={gradientColor}
      />
      {/* Opacity gradient overlay for fade effect at edges */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.3) 0%, transparent 10%, transparent 90%, rgba(0,0,0,0.3) 100%)',
        }}
      />
      <Box px={4} py={3} position="relative" zIndex={1}>
        <Flex alignItems="center" justifyContent="space-between" gap={4}>
          <Flex flex={1} direction="column" gap={1} minW={0}>
            <Heading
              as="h2"
              size="lg"
              fontWeight={600}
              color="white"
              textShadow="2px 2px 4px rgba(0,0,0,0.7)"
              noOfLines={1}
            >
              {watchlist.name}
            </Heading>
            {total > 0 && (
              <Text fontSize="sm" color="whiteAlpha.800" textShadow="1px 1px 2px rgba(0,0,0,0.7)">
                {seenCount}/{total} films seen
                {isComplete && (
                  <>
                    {" · "}
                    <Badge colorPalette="green" size="sm">List completed</Badge>
                  </>
                )}
              </Text>
            )}
          </Flex>
          <EditWatchlistDialog
            watchlist={watchlist}
            trigger={
              <IconButton
                variant="subtle"
                border="1px solid"
                borderColor="whiteAlpha.300"
                rounded="full"
                aria-label="Edit watchlist"
                size="sm"
              >
                <HiPencil />
              </IconButton>
            }
          />
        </Flex>
      </Box>
    </Box>
  );
}

