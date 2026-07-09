import type { Trail } from '../types'
import { TrailCard } from './TrailCard'

interface TrailsGridProps {
  trails: Trail[]
}

export function TrailsGrid({ trails }: TrailsGridProps) {
  return (
    <section className="trails-grid" id="trails-list" aria-label="Trilhas">
      {trails.map((trail) => (
        <TrailCard key={trail.id} trail={trail} />
      ))}
    </section>
  )
}
