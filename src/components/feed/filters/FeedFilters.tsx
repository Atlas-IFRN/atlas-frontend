import type { FeedFilter } from '../../../types/feed'
import { Circle } from 'lucide-react'
import { FilterTag } from '../../atoms/FilterTag'

interface FeedFiltersProps {
  active: FeedFilter
  onChange: (filter: FeedFilter) => void
}

const FILTERS: Array<{ value: FeedFilter; label: string }> = [
  { value: 'principal', label: 'Principal' },
  { value: 'mais-curtidos', label: 'Mais curtidos' },
  { value: 'docentes', label: 'Docentes' },
  { value: 'sistema', label: 'Sistema' },
]

/** Filtros segmentados do feed (estilo abas). */
export function FeedFilters({ active, onChange }: FeedFiltersProps) {
  return (
    <div className="feed-filters" role="tablist" aria-label="Filtrar feed">
      {FILTERS.map((filter) => {
        const isActive = filter.value === active

        return (
          <FilterTag
            aria-selected={isActive}
            active={isActive}
            iconLeft={isActive ? Circle : undefined}
            key={filter.value}
            onClick={() => onChange(filter.value)}
            role="tab"
            label={filter.label}
          />
        )
      })}
    </div>
  )
}
