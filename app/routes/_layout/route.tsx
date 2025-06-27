import { Avatar, Box, Container, defineStyle, Flex, Heading, Menu, Portal, Image, Button } from "@chakra-ui/react";
import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Form, json, Outlet, useLoaderData, useLocation } from "@remix-run/react";
import SearchFeature from "~/components/search/searchFeature";
import { ColorModeButton } from "~/components/ui/color-mode";

import { getOfficialMovieGenres } from "~/utils/services/external/tmdb/genres";
import { getSupabaseServerClient } from "~/utils/supabase.server";

import SidePanel from "../_common/side-panel";
import { getMovieProviders } from "~/utils/services/external/tmdb/watch-providers";
import { getPopularPeople } from "~/utils/services/external/tmdb/people";
import { getAvailableLanguages, getAvailableRegions } from "~/utils/services/external/tmdb/configuration";
import GoogleSignIn from "~/components/googleSignIn";

export const loader: LoaderFunction = async ({ request } : LoaderFunctionArgs) => {
  const headers = new Headers();
  const url = new URL(request.url);
  const filters = url.searchParams.get("filters");
  const sort = url.searchParams.get("sort");
  // const page = url.searchParams.get("page");

  const supabase = getSupabaseServerClient(request, headers);
  const { data: { session } } = await supabase.auth.getSession()

  console.log('_layout session', session)

  const { data: collections } = await supabase
    .from('collections')
    .select(`
      *,
      collection_items (
        movie_id,
        position,
        added_at,
        notes,
        source
      )
    `)
    .eq('is_system_generated', true)
    .order('created_at', { ascending: false });

    // Fetch movies for each genre in parallel

  let decodedFilters

  if( filters) {
    decodedFilters = JSON.parse(atob(filters))
    console.log('_layout chips', decodedFilters)
  }

  const [ genres, providers, people, regions, languages ] = await Promise.all([
    await getOfficialMovieGenres(),
    await getMovieProviders(),
    await getPopularPeople(),
    await getAvailableRegions(),
    await getAvailableLanguages()
  ]);
  const filterOptions = {
    genres,
    providers,
    people,
    regions,
    languages
  }
  console.log('loader people', people)

  return json({ session, filterOptions, decodedFilters, sort, collections }, { headers });
};

export default function Layout() {
  const location = useLocation();
  const { filterOptions, decodedFilters, session, sort, collections } = useLoaderData<typeof loader>();

  console.log('_LAYOUT session', session)

  console.log('Layout decodedFilters', decodedFilters)
  const ringCss = defineStyle({
    outlineWidth: "2px",
    outlineColor: "colorPalette.500",
    outlineOffset: "2px",
    outlineStyle: "solid",
  })

  return (
    <Container>
        <Flex direction="column" minH="100vh" gap={4}>
            <Box as="header" pt={4} display="flex" gap={4} alignItems="flex-start">
                <Heading as="h1" display="flex" alignItems="center" gap={1} >STORY <Image src="/public/logo.jpg"  width={10} height={10} alt="Brand"/> ARC</Heading>
                <SearchFeature genres={filterOptions.genres.genres}/>
                <Box display="flex" justifyContent="space-between" gap={4}>
                  <ColorModeButton />
                  {
                    !session ? (
                      <GoogleSignIn />
                    ) : (
                      <Menu.Root>
                        <Menu.Trigger>
                            <Avatar.Root css={ringCss} colorPalette="orange">
                              <Avatar.Fallback name="Random" />
                              <Avatar.Image src={session.user.user_metadata.avatar_url} />
                            </Avatar.Root>
                        </Menu.Trigger>
                        <Portal>
                          <Menu.Positioner>
                            <Menu.Content>
                                <Menu.Item value="new-txt">Settings</Menu.Item>
                                <Menu.Item value="new-file">Profile</Menu.Item>
                                <Menu.Item value="export"><Form action="/auth/logout"><Button type="submit">Sign out</Button></Form></Menu.Item>
                            </Menu.Content>
                          </Menu.Positioner>
                        </Portal>
                      </Menu.Root>
                    )
                  }
                </Box>
            </Box>   
            <Flex as="main" flex="1" direction={{ base: "column", md: "row" }} gap={2} alignItems="start">
              <SidePanel genres={filterOptions.genres.genres} providers={filterOptions.providers.results} people={filterOptions.people.results} regions={filterOptions.regions} languages={filterOptions.languages} defaults={decodedFilters} sort_by={sort} collections={collections}/>
              <Box bgColor="bg.muted" rounded="lg" flex="1">
                <Outlet key={location.key} context={{ background: location }} />
              </Box>
            </Flex>
            <Box as="footer" p={4} display="flex" justifyContent="end">
                {/* <Heading size="lg">Footer</Heading> */}
                <small>Logo created by <a href="https://www.designevo.com/" title="Free Online Logo Maker">DesignEvo logo maker</a></small>
            </Box>
        </Flex>
    </Container>
  );
}