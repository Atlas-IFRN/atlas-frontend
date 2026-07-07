import type { TrailFilter } from './types'

export const TRAIL_FILTER_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'enrolled', label: 'Minhas trilhas' },
  { value: 'new', label: 'Novas' },
] satisfies Array<{ value: TrailFilter; label: string }>
