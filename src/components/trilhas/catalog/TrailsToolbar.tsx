import type { ChangeEvent } from 'react'
import { FilterTag } from '../../atoms/FilterTag'
import { SearchInput } from '../../atoms/SearchInput'
import type { TrailFilter } from '../../../types/tracks'
import { TRAIL_FILTER_OPTIONS } from './filterOptions'

export interface TrailsToolbarProps {
  filter: TrailFilter
  query: string
  onFilterChange: (filter: TrailFilter) => void
  onQueryChange: (query: string) => void
}

export function TrailsToolbar({
  filter,
  query,
  onFilterChange,
  onQueryChange,
}: TrailsToolbarProps) {
  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    onQueryChange(event.target.value)
  }

  return (
    <div className="trails-toolbar">
      <SearchInput
        aria-label="Buscar trilha por título ou tecnologia"
        className="trails-toolbar__search"
        onChange={handleQueryChange}
        placeholder="Buscar trilha ou tecnologia..."
        value={query}
      />

      <div className="trails-toolbar__filters" aria-label="Filtrar trilhas">
        {TRAIL_FILTER_OPTIONS.map((option) => (
          <FilterTag
            active={filter === option.value}
            key={option.value}
            label={option.label}
            onClick={() => onFilterChange(option.value)}
          />
        ))}
      </div>
    </div>
  )
}
