import type { FeedTrackProgress } from '../../../types/feed'
import { RailTrackList } from './RailTrackList'

interface FeedRightRailProps {
  tracks: FeedTrackProgress[]
  isLoading?: boolean
}

/** Coluna lateral direita do feed. */
export function FeedRightRail({ tracks, isLoading }: FeedRightRailProps) {
  return (
    <aside className="feed-right" aria-label="Minhas trilhas">
      <RailTrackList tracks={tracks} isLoading={isLoading} />
    </aside>
  )
}
