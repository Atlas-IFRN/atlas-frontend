import { useEffect, useMemo, useState } from 'react'
import { SearchX } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../components/states'
import {
  TrailsGrid,
  TrailsHero,
  TrailsToolbar,
} from '../../components/trilhas'
import { useTracks } from '../../hooks/useTracks'
import type { TrailFilter } from '../../types/tracks'
import '../../components/trilhas/TrailsCatalog.css'

function isTeacherRole(role: string | undefined) {
  const normalizedRole = role?.trim().toLowerCase()

  return normalizedRole === 'teacher' || normalizedRole === 'professor'
}

const FILTER_QUERY_VALUES: Record<string, TrailFilter> = {
  todas: 'all',
  inscritas: 'enrolled',
  'em-andamento': 'in-progress',
  concluidas: 'completed',
  novas: 'new',
}

const FILTER_URL_VALUES: Record<TrailFilter, string> = {
  all: 'todas',
  enrolled: 'inscritas',
  'in-progress': 'em-andamento',
  completed: 'concluidas',
  new: 'novas',
}

export default function TracksPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const filter = FILTER_QUERY_VALUES[searchParams.get('filtro') ?? ''] ?? 'all'
  const {
    data: trails = [],
    isError,
    isLoading,
    refetch,
  } = useTracks()
  const isTeacher = isTeacherRole(user?.role)

  useEffect(() => {
    document.title = 'Trilhas | ATLAS'

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

    return trails.filter((trail) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'enrolled' && trail.enrolled) ||
        (filter === 'in-progress' && trail.enrollmentStatus === 'IN_PROGRESS') ||
        (filter === 'completed' && trail.enrollmentStatus === 'COMPLETED') ||
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
  }, [filter, query, trails])

  function handleClearSearch() {
    setQuery('')
    setSearchParams({}, { replace: true })
  }

  function handleFilterChange(nextFilter: TrailFilter) {
    if (nextFilter === 'all') {
      setSearchParams({}, { replace: true })
      return
    }

    setSearchParams(
      { filtro: FILTER_URL_VALUES[nextFilter] },
      { replace: true },
    )
  }

  function handleRetry() {
    void refetch()
  }

  return (
    <main className="trails-page">
      <TrailsHero canCreate={isTeacher} createHref="/trilhas/nova" />
      <TrailsToolbar
        filter={filter}
        onFilterChange={handleFilterChange}
        onQueryChange={setQuery}
        query={query}
      />

      {isLoading ? (
        <LoadingState
          message="Carregando trilhas..."
          skeletonCount={6}
          variant="skeleton"
        />
      ) : isError ? (
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
