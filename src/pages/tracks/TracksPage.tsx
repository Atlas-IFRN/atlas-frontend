import { useEffect, useMemo, useState } from 'react'
import { SearchX } from 'lucide-react'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../components/states'
import {
  TrailsGrid,
  TrailsHero,
  TrailsStatsGrid,
  TrailsToolbar,
  type TrailFilter,
} from '../../components/trilhas'
import { TRILHAS } from './trailsData'

export default function TracksPage() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<TrailFilter>('all')
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'ready'>(
    'ready',
  )

  useEffect(() => {
    document.title = 'ATLAS · Trilhas'

    const description =
      'Catálogo de trilhas do ATLAS com percursos por área tecnológica, progresso, busca e filtros.'
    let metaDescription = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    )

    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.name = 'description'
      document.head.appendChild(metaDescription)
    }

    metaDescription.content = description
  }, [])

  const filteredTrails = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR')

    return TRILHAS.filter((trail) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'enrolled' && trail.enrolled) ||
        (filter === 'new' && trail.isNew)

      if (!matchesFilter) {
        return false
      }

      if (!normalizedQuery) {
        return true
      }

      const searchableText = [
        trail.title,
        trail.area,
        trail.description,
        ...trail.skills,
      ]
        .join(' ')
        .toLocaleLowerCase('pt-BR')

      return searchableText.includes(normalizedQuery)
    })
  }, [filter, query])

  const stats = useMemo(
    () => ({
      activeTrails: TRILHAS.length,
      certificates: 4,
      scholarships: 8,
    }),
    [],
  )

  function handleClearSearch() {
    setQuery('')
    setFilter('all')
  }

  function handleRetry() {
    setLoadState('ready')
  }

  return (
    <main className="trails-page">
      <TrailsHero createHref="/trilhas/nova" />
      <TrailsStatsGrid stats={stats} />
      <TrailsToolbar
        filter={filter}
        onFilterChange={setFilter}
        onQueryChange={setQuery}
        query={query}
      />

      {loadState === 'loading' ? (
        <LoadingState
          message="Carregando trilhas..."
          skeletonCount={6}
          variant="skeleton"
        />
      ) : loadState === 'error' ? (
        <ErrorState
          message="Não foi possível carregar o catálogo de trilhas agora."
          onRetry={handleRetry}
        />
      ) : filteredTrails.length === 0 ? (
        <EmptyState
          actionLabel="Limpar busca"
          description="Tente outro termo ou volte para todas as trilhas disponíveis."
          icon={SearchX}
          onAction={handleClearSearch}
          title="Nenhuma trilha encontrada"
        />
      ) : (
        <TrailsGrid trails={filteredTrails} />
      )}
    </main>
  )
}
