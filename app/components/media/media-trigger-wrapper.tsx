import { ReactNode } from 'react'
import { TmdbMovieSummaryInterface } from '~/interfaces/tmdb/movie/summary'
import { TmdbTVSeriesSummaryInterface } from '~/interfaces/tmdb/tv/series/summary'
import { TmdbCollectionsInterface } from '~/interfaces/tmdb/tmdb-collections'
import MovieDialog from '~/components/movie/movie-dialog'
import MediaPanelTrigger from '~/components/media/info-panel/trigger'
import CollectionPanelTrigger from '~/components/collections/info-panel/trigger'
import TVSeriesPanelTrigger from '~/components/tv/series/info-panel/trigger'
import TVSeasonsPanelTrigger from '~/components/tv/seasons/info-panel/trigger'
import { TVSeasonSummaryInterface } from '~/interfaces/tmdb/tv/season/summary'
import { TVEpisodeSummaryInterface } from '~/interfaces/tmdb/tv/episode/summary'
import TvEpisodePanelTrigger from '~/components/tv/episodes/info-panel/trigger'
import { Link } from '@remix-run/react'

// Union type for all possible media items
type MediaItem = 
  | { type: 'movie'; data: TmdbMovieSummaryInterface }
  | { type: 'tv'; data: TmdbTVSeriesSummaryInterface }
  | { type: 'tv-series'; data: TmdbTVSeriesSummaryInterface }
  | { type: 'tv-season'; data: TVSeasonSummaryInterface, seriesId: number }
  | { type: 'tv-episode'; data: TVEpisodeSummaryInterface, seriesId: number }
  | { type: 'collection'; data: TmdbCollectionsInterface }

type MediaTriggerWrapperProps = {
  media: MediaItem
  children: ReactNode
  variant?: 'dialog' | 'info-panel' | 'link'
}

export default function MediaTriggerWrapper({ media, children, variant = 'info-panel' }: MediaTriggerWrapperProps) {
  // Early return for dialog variant (only movies support dialogs currently)
  if (variant === 'dialog') {
    if (media.type === 'movie') {
      return (
        <MovieDialog item={media.data}>
          {children}
        </MovieDialog>
      )
    }
    // For non-movie types, fall back to info-panel
    variant = 'info-panel'
  }

  if (variant === 'link') {
    if ((media.data as TmdbMovieSummaryInterface | TmdbTVSeriesSummaryInterface).media_type === 'tv') {
        return (
        <Link to={`/tv/series/${media.data.id}`}>
            {children}
            </Link>
        )
        }
    if (media.type === 'tv') {
      return (
        <Link to={`/tv/series/${media.data.id}`}>
          {children}
        </Link>
      )
    }
  }

  // Info panel variants - each media type gets its appropriate trigger
  switch (media.type) {
    case 'movie':
      return (
        <MediaPanelTrigger item={media.data}>
          {children}
        </MediaPanelTrigger>
    )

    case 'tv':
        return (
          <MediaPanelTrigger item={media.data}>
            {children}
          </MediaPanelTrigger>
      )
    
    case 'tv-series':
      return (
        <TVSeriesPanelTrigger item={media.data}>
          {children}
        </TVSeriesPanelTrigger>
    )

    case 'tv-season':
      return (
        <TVSeasonsPanelTrigger item={media.data} seriesId={media.seriesId}>
          {children}
        </TVSeasonsPanelTrigger>
    )

    case 'tv-episode':
      return (
        <TvEpisodePanelTrigger item={media.data} seriesId={media.data.show_id}>
          {children}
        </TvEpisodePanelTrigger>
      )
    
    case 'collection':
      return (
        <CollectionPanelTrigger item={media.data}>
          {children}
        </CollectionPanelTrigger>
      )
    
    default:
      return <>{children}</>
  }
}