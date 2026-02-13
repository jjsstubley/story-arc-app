// app/contexts/movie-panel-context.tsx
"use client"
import { createContext, useContext, useState } from "react"
import { TmdbMovieDetailWAppendsProps } from "~/interfaces/tmdb/movie/detail"
import { TmdbTVSeriesDetailWAppendsProps } from "~/interfaces/tmdb/tv/series/details"
import { TmdbCollectionsInterface } from "~/interfaces/tmdb/tmdb-collections"
import { TVSeasonDetailsInterface } from "~/interfaces/tmdb/tv/season/details"
import { TVEpisodeDetailsInterface } from "~/interfaces/tmdb/tv/episode/details"

export type MediaItem = {
  type: 'movie' | 'tv' | 'credit' | 'collection' | 'company' | 'tv-series' | 'tv-season' | 'tv-episode'
  data: TmdbMovieDetailWAppendsProps | TmdbTVSeriesDetailWAppendsProps | TmdbCollectionsInterface | TVSeasonDetailsInterface | TVEpisodeDetailsInterface // You can make this more specific with discriminated unions if needed
}

const MediaPanelContext = createContext<{
  selectedMedia: MediaItem | null
  isOpen: boolean
  openPanel: (media: MediaItem) => void
  closePanel: () => void
}>({
  selectedMedia: null,
  isOpen: false,
  openPanel: () => {},
  closePanel: () => {},
})

export function MediaPanelProvider({ children }: { children: React.ReactNode }) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const openPanel = (media: MediaItem) => {
    setSelectedMedia(media)
    setIsOpen(true)
  }

  const closePanel = () => {
    setSelectedMedia(null)
    setIsOpen(false)
  }

  return (
    <MediaPanelContext.Provider value={{ selectedMedia, isOpen, openPanel, closePanel }}>
      {children}
    </MediaPanelContext.Provider>
  )
}

export function useMediaPanel() {
  return useContext(MediaPanelContext)
}