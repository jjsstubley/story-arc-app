import { Box, Container, Flex, Heading, Image } from "@chakra-ui/react";
import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, Outlet, useLoaderData, useLocation } from "@remix-run/react";
// import SearchFeature from "~/components/search/searchFeature";
import { ColorModeButton } from "~/components/ui/color-mode";

import { getOfficialMovieGenres } from "~/utils/services/external/tmdb/genres";
import { getSupabaseServerClient } from "~/utils/supabase.server";

// import SidePanel from "../_common/side-panel";
import { getMovieProviders } from "~/utils/services/external/tmdb/watch-providers";
import { getPopularPeople } from "~/utils/services/external/tmdb/people";
import { getAvailableLanguages, getAvailableRegions } from "~/utils/services/external/tmdb/configuration";

import InfoPanelWrapper from "../_common/info-panel-wrapper";
import { getPopcornWatchlistWMovies } from "~/utils/services/cookies/popcorn-watchlist";
import { WatchlistProvider } from "~/components/providers/watchlist-context";
import GlobalSearch from "~/components/search/global-search";
import { MediaPanelProvider } from "~/components/providers/media-provider";
import PopcornDialog from "~/components/user-actions/popcorn/popcorn-dialog";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ArcSidePanel from "~/components/sidepanel/arc-side-panel";
import { decodeValues } from "~/utils/helpers";

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
    decodedFilters = decodeValues(filters)
    console.log('_layout chips', decodedFilters)
  }

  const [ genres, providers, people, regions, languages, popcornWatchlist ] = await Promise.all([
    await getOfficialMovieGenres(),
    await getMovieProviders(),
    await getPopularPeople(),
    await getAvailableRegions(),
    await getAvailableLanguages(),
    await getPopcornWatchlistWMovies(request)
  ]);

  const filterOptions = {
    genres: genres.genres,
    providers: providers.results,
    people: people.results,
    regions: regions,
    languages: languages,
    sort_by: sort,
    collections,
    defaults: decodedFilters,
    watchlists: popcornWatchlist ? [popcornWatchlist] : []
  }

  return json({ session, filterOptions }, { headers });
};

export default function Layout() {
  const location = useLocation();
  const { filterOptions, session } = useLoaderData<typeof loader>();

  console.log('_LAYOUT session', session)

  console.log('Layout decodedFilters', filterOptions.defaults)
  // const ringCss = defineStyle({
  //   outlineWidth: "2px",
  //   outlineColor: "colorPalette.500",
  //   outlineOffset: "2px",
  //   outlineStyle: "solid",
  // })

  return (
    <Container>
      <WatchlistProvider> 
          <MediaPanelProvider> 
            <Flex direction="column" minH="100vh" gap={4}>
                <Box as="header" pt={4} display="flex" gap={4} alignItems="flex-start">
                    <Box w={{ base: "100%", md: "25%" }} alignItems="center">
                      <Heading as="h1" display="flex" alignItems="center" gap={1} > <Box rounded="full" bg="black" p={1} border="1px solid" borderColor="whiteAlpha.200" overflow="hidden"><Image src="/public/logo.jpg"  width={10} height={10} alt="Brand"/></Box> story arc</Heading>
                    </Box>
                    <GlobalSearch />
                    <Box display="flex" justifyContent="space-between" gap={4}>
                      <ColorModeButton />
                    </Box>
                </Box>   
                <PanelGroup direction="horizontal" className="main-panel-group">
                  <ArcSidePanel filters={filterOptions} session={session}/>
                  <Box w="8px" />
                  <Panel defaultSize={50} minSize={20} maxSize={80} order={1}>
                    <Box bgColor="bg.muted" rounded="lg" flex="1">
                      <Outlet key={location.key} context={{ background: location }} />
                    </Box>
                  </Panel>
                  <PanelResizeHandle className="resize-handle" style={{ width: '8px', cursor: 'col-resize' }} />
                  
                  <InfoPanelWrapper />
                 
                  {/* <SidePanel genres={filterOptions.genres.genres} providers={filterOptions.providers.results} people={filterOptions.people.results} regions={filterOptions.regions} languages={filterOptions.languages} defaults={decodedFilters} sort_by={sort} collections={collections}/> */}
                </PanelGroup>
            </Flex>
          </MediaPanelProvider> 
          <PopcornDialog watchlists={filterOptions.watchlists} />
      </WatchlistProvider>
    </Container>
  );
}