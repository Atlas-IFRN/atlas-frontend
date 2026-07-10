import { RailTrackList } from '../molecules/RailTrackList'
import type { FeedTrackProgress } from '../types'

interface FeedRightRailProps {
  tracks: FeedTrackProgress[]
}

/** Coluna lateral direita do feed. */
export function FeedRightRail({ tracks }: FeedRightRailProps) {
  return (
    <aside className="feed-right" aria-label="Minhas trilhas">
      <RailTrackList tracks={tracks} />
    </aside>
  )
}
