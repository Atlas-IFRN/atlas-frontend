import type { ActiveScholarship } from '../../../types/feed'
import { ActiveScholarships } from './ActiveScholarships'

interface FeedLeftRailProps {
  scholarships: ActiveScholarship[]
}

/** Coluna lateral esquerda do feed. */
export function FeedLeftRail({ scholarships }: FeedLeftRailProps) {
  return (
    <aside className="feed-rail" aria-label="Bolsas ativas">
      <ActiveScholarships scholarships={scholarships} />
    </aside>
  )
}
