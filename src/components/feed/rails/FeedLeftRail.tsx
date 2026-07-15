import type { ActiveScholarship } from '../../../types/feed'
import { ActiveScholarships } from './ActiveScholarships'

interface FeedLeftRailProps {
  scholarships: ActiveScholarship[]
  isLoading?: boolean
}

/** Coluna lateral esquerda do feed. */
export function FeedLeftRail({ scholarships, isLoading }: FeedLeftRailProps) {
  return (
    <aside className="feed-rail" aria-label="Bolsas ativas">
      <ActiveScholarships scholarships={scholarships} isLoading={isLoading} />
    </aside>
  )
}
