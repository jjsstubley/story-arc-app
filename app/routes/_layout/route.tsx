import { Avatar, Box, Container, defineStyle, Flex, Heading, MenuContent, MenuItem, MenuRoot, MenuTrigger, Text } from "@chakra-ui/react";
import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, Link, Outlet, useLoaderData, useLocation } from "@remix-run/react";
import SearchFeature from "~/components/search/searchFeature";
import { ColorModeButton } from "~/components/ui/color-mode";

import { MdOutlineSubdirectoryArrowRight } from "react-icons/md";
import { GoDotFill } from "react-icons/go"

import { getOfficialMovieGenres } from "~/utils/services/external/tmdb/genres";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import { GenreInterface } from "~/interfaces/genre";

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
                <Heading as="h1">&#123;&#123; Story Arc &#125;&#125; </Heading>
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
              <Box as="nav" w={{ base: "100%", md: "25%" }} minWidth="300px" p={4} bgColor="bg.muted" rounded="lg">
                {/* <Text>Sidebar</Text> */}
                <Link to="/genres"><Box display="flex" gap={2} alignItems="center" color="gray.700"><MdOutlineSubdirectoryArrowRight /><Heading as="h3" fontSize="sm" letterSpacing="0.225em">Genre</Heading></Box></Link>
                {/* <Box height="1px" width="100%" bg="gray.700" mt={4}></Box> */}
                {
                  genres.genres.map((item: GenreInterface, index: number) => (
                    <Box key={index} display="flex" gap={2} alignItems="center" mt={4} color="whiteAlpha.500"><GoDotFill /><Link to={`/genre/${item.name.toLowerCase()}`}><Text fontSize="smaller">{item.name}</Text></Link></Box>
                  ))
                }
              </Box>
              <Box p={4} bgColor="bg.muted" rounded="lg">
                <Outlet key={location.key} context={{ background: location }} />
              </Box>
            </Flex>
            <Box as="footer" p={4}>
                <Heading size="lg">Footer</Heading>
            </Box>
        </Flex>
    </Container>
  );
}