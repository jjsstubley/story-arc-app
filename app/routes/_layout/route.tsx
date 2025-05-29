import { Avatar, Box, Container, defineStyle, Flex, Heading, MenuContent, MenuItem, MenuRoot, MenuTrigger, Image } from "@chakra-ui/react";
import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json,  Outlet, useLoaderData, useLocation } from "@remix-run/react";
import SearchFeature from "~/components/search/searchFeature";
import { ColorModeButton } from "~/components/ui/color-mode";

import { getOfficialMovieGenres } from "~/utils/services/external/tmdb/genres";
import { getSupabaseServerClient } from "~/utils/supabase.server";

import SidePanel from "../_common/side-panel";

export const loader: LoaderFunction = async ({ request } : LoaderFunctionArgs) => {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);
  const { data: { session } } = await supabase.auth.getSession()
  
  const [ genres ] = await Promise.all([
    await getOfficialMovieGenres(),
  ]);

  console.log('genres', genres)

  return json({ session, genres }, { headers });
};

export default function Layout() {
  const location = useLocation();
  const { genres } = useLoaderData<typeof loader>();


  const ringCss = defineStyle({
    outlineWidth: "2px",
    outlineColor: "colorPalette.500",
    outlineOffset: "2px",
    outlineStyle: "solid",
  })

  return (
    <Container>
        <Flex direction="column" minH="100vh" gap={4}>
            <Box as="header"  p={4} display="flex" justifyContent="space-between">
                <Heading as="h1" display="flex" alignItems="center" gap={1} >STORY <Image src="/public/logo.jpg"  width={10} height={10} alt="Brand"/> ARC</Heading>
          
                <Box display="flex" justifyContent="space-between" gap={4}>
                <ColorModeButton />
                <Box>
                    <MenuRoot>
                    <MenuTrigger>
                        <Avatar.Root css={ringCss} colorPalette="blue">
                          <Avatar.Fallback name="Random" />
                          <Avatar.Image src="https://randomuser.me/api/portraits/men/70.jpg" />
                        </Avatar.Root>
                    </MenuTrigger>
                    <MenuContent>
                        <MenuItem value="new-txt">Settings</MenuItem>
                        <MenuItem value="new-file">Profile</MenuItem>
                        <MenuItem value="export">Sign out</MenuItem>
                    </MenuContent>
                    </MenuRoot>
                </Box>
                </Box>
            </Box>    
            <SearchFeature genres={genres.genres}/>
            <Flex as="main" flex="1" direction={{ base: "column", md: "row" }} py={4} gap={2} alignItems="start">
              <SidePanel />
              <Box p={4} bgColor="bg.muted" rounded="lg">
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