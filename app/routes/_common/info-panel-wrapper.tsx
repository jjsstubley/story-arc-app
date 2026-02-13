// app/components/movie-panel-wrapper.tsx (Client Component)
"use client"
import { Box } from "@chakra-ui/react"
import { MovieInfoPanel } from "~/components/movie/info-panel"
import { useMediaPanel } from "~/components/providers/media-provider"
import { TmdbMovieDetailWAppendsProps } from "~/interfaces/tmdb/movie/detail"
import { TVSeriesInfoPanel } from "~/components/tv/series/info-panel"
import { TmdbTVSeriesDetailWAppendsProps } from "~/interfaces/tmdb/tv/series/details"
import { TmdbCollectionsInterface } from "~/interfaces/tmdb/tmdb-collections"
import { CollectionInfoPanel } from "~/components/collections/info-panel"
import { TVSeasonInfoPanel } from "~/components/tv/seasons/info-panel"
import { TVSeasonDetailsInterface } from "~/interfaces/tmdb/tv/season/details"
import { TVEpisodeDetailsInterface } from "~/interfaces/tmdb/tv/episode/details"
import { TVEpisodeInfoPanel } from "~/components/tv/episodes/info-panel"
import {  Panel } from "react-resizable-panels"

export default function InfoPanelWrapper() {
  const { selectedMedia, isOpen, closePanel } = useMediaPanel()
  

  return isOpen && (
    <Panel 
      defaultSize={35}
      minSize={35} 
      maxSize={50}
      order={2}
    >
    <Box
      // flexBasis={isOpen ? "350px" : "0px"}
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
      transition="all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
    >
      {/* ✅ Server component for content */}
      <Box opacity={isOpen ? 1 : 0} transition="opacity 1s cubic-bezier(0.4, 0, 0.2, 1)">
        {selectedMedia?.type === 'movie' && selectedMedia?.data && (
            <MovieInfoPanel movie={selectedMedia.data as TmdbMovieDetailWAppendsProps} onClose={closePanel} />
        )}
        {selectedMedia?.type === 'tv' && selectedMedia?.data && (
            <TVSeriesInfoPanel series={selectedMedia.data as TmdbTVSeriesDetailWAppendsProps} onClose={closePanel} />
        )}
        {selectedMedia?.type === 'tv-season' && selectedMedia?.data && (
            <TVSeasonInfoPanel season={selectedMedia.data as TVSeasonDetailsInterface} onClose={closePanel} />
        )}
        {selectedMedia?.type === 'tv-episode' && selectedMedia?.data && (
            <TVEpisodeInfoPanel episode={selectedMedia.data as TVEpisodeDetailsInterface} onClose={closePanel} />
        )}
        {selectedMedia?.type === 'collection' && selectedMedia?.data && (
            <CollectionInfoPanel collection={selectedMedia.data as TmdbCollectionsInterface} onClose={closePanel} />
        )}
      </Box>
    </Box>
    </Panel>
  )
}