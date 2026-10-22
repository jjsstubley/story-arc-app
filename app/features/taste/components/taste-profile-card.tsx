import { Badge, Box, Heading, Text, Wrap } from "@chakra-ui/react";
import type { TasteProfile } from "../types";

const TIER_GROUPS = [
  { label: "Loved", match: (tier: string) => !["Bad", "Awful", "Watched", "Watchlist"].includes(tier) },
  { label: "Didn't enjoy", match: (tier: string) => ["Bad", "Awful"].includes(tier) },
  { label: "Recently watched", match: (tier: string) => tier === "Watched" },
  { label: "Want to watch", match: (tier: string) => tier === "Watchlist" },
];

/** What the app thinks the user likes, and the films that told it */
export default function TasteProfileCard({ profile }: { profile: TasteProfile | null }) {
  if (!profile) {
    return (
      <Box p={5} rounded="lg" border="1px dashed" borderColor="whiteAlpha.300">
        <Heading as="h3" size="md" fontWeight="light" mb={2}>No profile yet</Heading>
        <Text fontSize="sm" color="fg.muted">
          Rate, favourite or mark a few films as watched, or set some preferences, and we&apos;ll describe your taste here.
        </Text>
      </Box>
    );
  }

  return (
    <Box p={5} rounded="lg" bg="blackAlpha.300" border="1px solid" borderColor="whiteAlpha.200">
      <Text fontSize="2xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="0.3em" color="orange.400" mb={2}>
        How we see your taste
      </Text>
      <Text fontSize="md" lineHeight="tall" mb={5}>{profile.summary}</Text>

      {profile.likes.length > 0 && (
        <Box mb={4}>
          <Text fontSize="xs" color="fg.muted" mb={2}>You tend to like</Text>
          <Wrap gap={2}>
            {profile.likes.map((like) => (
              <Badge key={like} variant="outline" colorPalette="green" rounded="full" px={3}>{like}</Badge>
            ))}
          </Wrap>
        </Box>
      )}
      {profile.dislikes.length > 0 && (
        <Box mb={4}>
          <Text fontSize="xs" color="fg.muted" mb={2}>Not so much</Text>
          <Wrap gap={2}>
            {profile.dislikes.map((dislike) => (
              <Badge key={dislike} variant="outline" colorPalette="red" rounded="full" px={3}>{dislike}</Badge>
            ))}
          </Wrap>
        </Box>
      )}

      {TIER_GROUPS.map(({ label, match }) => {
        const anchors = profile.anchors.filter((anchor) => match(anchor.tier));
        if (anchors.length === 0) return null;
        return (
          <Box key={label} mt={3}>
            <Text fontSize="xs" color="fg.muted" mb={1}>{label}</Text>
            <Text fontSize="sm" color="whiteAlpha.800">
              {anchors.map((anchor) => `${anchor.title}${anchor.year ? ` (${anchor.year})` : ""}`).join(" · ")}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
