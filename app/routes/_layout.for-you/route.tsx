import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Box, Button, Heading, Text } from "@chakra-ui/react";
import { ForYouPage } from "~/features/taste";
import { getForYouState, getTastePreferences } from "~/features/taste/index.server";
import { getOfficialMovieGenres } from "~/utils/services/external/tmdb/genres";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return json({ signedIn: false as const }, { headers });

  // Reads only; any regeneration happens from the client so the page renders straight away
  const [state, preferences, genres] = await Promise.all([
    getForYouState(user.id, supabase),
    getTastePreferences(user.id, supabase),
    getOfficialMovieGenres(),
  ]);
  return json({ signedIn: true as const, state, preferences, genres: genres?.genres ?? [] }, { headers });
};

export const meta: MetaFunction = () => [
  { title: "For you | Story Arc" },
  { name: "description", content: "Your taste profile and film lists made for you" },
];

export default function ForYouRoute() {
  const data = useLoaderData<typeof loader>();

  if (!data.signedIn) {
    return (
      <Box minH="60vh" display="flex" alignItems="center" justifyContent="center" textAlign="center" p={8}>
        <Box>
          <Heading size="lg" fontWeight="light" mb={3}>Lists made for you</Heading>
          <Text color="fg.muted" mb={5}>Sign in to build your taste profile and get personal film lists.</Text>
          <Link to="/auth/login">
            <Button colorPalette="orange">Sign in</Button>
          </Link>
        </Box>
      </Box>
    );
  }

  return <ForYouPage initialState={data.state} initialPreferences={data.preferences} genres={data.genres} />;
}
