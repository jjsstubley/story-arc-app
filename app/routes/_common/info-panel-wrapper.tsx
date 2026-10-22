import { Box, Drawer, Portal, useBreakpointValue } from "@chakra-ui/react"
import { Panel, PanelResizeHandle } from "react-resizable-panels"
import { MovieInfoPanel } from "~/components/movie/info-panel"
import { useMediaPanel, type MediaItem } from "~/components/providers/media-provider"
import { TmdbMovieDetailWAppendsProps } from "~/interfaces/tmdb/movie/detail"
import { TVSeriesInfoPanel } from "~/components/tv/series/info-panel"
import { TmdbTVSeriesDetailWAppendsProps } from "~/interfaces/tmdb/tv/series/details"
import { TmdbCollectionsInterface } from "~/interfaces/tmdb/tmdb-collections"
import { CollectionInfoPanel } from "~/components/collections/info-panel"
import { TVSeasonInfoPanel } from "~/components/tv/seasons/info-panel"
import { TVSeasonDetailsInterface } from "~/interfaces/tmdb/tv/season/details"
import { TVEpisodeDetailsInterface } from "~/interfaces/tmdb/tv/episode/details"
import { TVEpisodeInfoPanel } from "~/components/tv/episodes/info-panel"
import { InsideModal } from "~/shared/ui/portal-context"

/**
 * The selected media's details: a resizable side panel on desktop, a
 * full-height bottom sheet on small screens. Must be rendered inside the
 * layout's PanelGroup. The panel only opens after a click, so the
 * breakpoint is always known by then.
 */
export default function InfoPanelWrapper() {
  const { selectedMedia, isOpen, closePanel } = useMediaPanel()
  const isDesktop = useBreakpointValue({ base: false, md: true })

  if (!isOpen || !selectedMedia) return null

  if (!isDesktop) {
    return (
      <Drawer.Root open onOpenChange={(e) => !e.open && closePanel()} placement="bottom">
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content roundedTop="xl" h="95dvh" overflowY="auto" pb="env(safe-area-inset-bottom)">
              <InsideModal>
                <InfoPanelContent media={selectedMedia} onClose={closePanel} />
              </InsideModal>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    )
  }

  return (
    <>
      <PanelResizeHandle className="resize-handle" style={{ width: '8px', cursor: 'col-resize' }} />
      <Panel
        defaultSize={35}
        minSize={35}
        maxSize={50}
        order={2}
      >
        <Box
          bg="bg.muted"
          rounded="md"
          borderColor="gray.200"
          height="calc(100vh - 100px)"
          overflow="auto"
          overflowY="scroll"
          css={{
            scrollbarGutter: 'stable', // Prevents layout shift
            '&::-webkit-scrollbar': {
              width: '8px',
              position: 'absolute',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'gray.600',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'gray.500',
            },
          }}
        >
          <InfoPanelContent media={selectedMedia} onClose={closePanel} />
        </Box>
      </Panel>
    </>
  )
}

function InfoPanelContent({ media, onClose }: { media: MediaItem; onClose: () => void }) {
  switch (media.type) {
    case 'movie':
      return <MovieInfoPanel movie={media.data as TmdbMovieDetailWAppendsProps} onClose={onClose} />
    case 'tv':
      return <TVSeriesInfoPanel series={media.data as TmdbTVSeriesDetailWAppendsProps} onClose={onClose} />
    case 'tv-season':
      return <TVSeasonInfoPanel season={media.data as TVSeasonDetailsInterface} onClose={onClose} seriesId={media.seriesId} />
    case 'tv-episode':
      return <TVEpisodeInfoPanel episode={media.data as TVEpisodeDetailsInterface} onClose={onClose} seriesId={media.seriesId} />
    case 'collection':
      return <CollectionInfoPanel collection={media.data as TmdbCollectionsInterface} onClose={onClose} />
    default:
      return null
  }
}
