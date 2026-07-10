import { ActiveScholarships } from '../molecules/ActiveScholarships'
import type { ActiveScholarship } from '../types'

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
