import type { FeedFilter } from '../types'

interface FeedFiltersProps {
  active: FeedFilter
  onChange: (filter: FeedFilter) => void
}

const FILTERS: Array<{ value: FeedFilter; label: string }> = [
  { value: 'for-you', label: 'Para você' },
  { value: 'following', label: 'Seguindo' },
  { value: 'community', label: 'Comunidade' },
  { value: 'notices', label: 'Avisos' },
]

/** Filtros segmentados do feed (estilo abas). */
export function FeedFilters({ active, onChange }: FeedFiltersProps) {
  return (
    <div className="feed-filters" role="tablist" aria-label="Filtrar feed">
      {FILTERS.map((filter) => {
        const isActive = filter.value === active

        return (
          <button
            aria-selected={isActive}
            className={`feed-filter${isActive ? ' feed-filter--active' : ''}`}
            key={filter.value}
            onClick={() => onChange(filter.value)}
            role="tab"
            type="button"
          >
            {filter.label}
          </button>
        )
      })}
    </div>
  )
}
