import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import {
  Circle,
  PackageOpen,
  Plus,
  Search,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { listScholarships } from '../../services/scholarships'
import { Button } from '../../components/atoms/Button'
import { FilterTag } from '../../components/atoms/FilterTag'
import { ScholarshipCard } from '../../components/molecules/ScholarshipCard'
import { EmptyState, ErrorState, LoadingState } from '../../components/states'
import type { Scholarship, ScholarshipStatus } from '../../types/scholarships'
import './ScholarshipsPage.css'

type ScholarshipFilter =
  | 'all'
  | 'open'
  | 'closing'
  | 'closed'

interface FilterOption {
  id: ScholarshipFilter
  label: string
}

interface ApiErrorBody {
  detail?: unknown
}

const filters: FilterOption[] = [
  { id: 'all', label: 'Todas' },
  { id: 'open', label: 'Abertas' },
  { id: 'closing', label: 'Encerrando' },
  { id: 'closed', label: 'Encerradas' },
]

const emptyScholarships: Scholarship[] = []

const statusOrder: Record<ScholarshipStatus, number> = {
  Open: 0,
  RegistrationClosed: 1,
  Closed: 2,
  Draft: 3,
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function getScholarshipText(scholarship: Scholarship) {
  return normalizeText(
    [
      scholarship.title,
      scholarship.description,
      scholarship.activityDescription,
      ...scholarship.technologies.map((technology) => technology.name),
    ].join(' '),
  )
}

function isTeacherRole(role: string | undefined) {
  const normalizedRole = role?.trim().toLowerCase()

  return normalizedRole === 'teacher' || normalizedRole === 'professor'
}

function matchesFilter(
  scholarship: Scholarship,
  filter: ScholarshipFilter,
) {
  if (filter === 'all') {
    return true
  }

  if (filter === 'closing') {
    return scholarship.status === 'RegistrationClosed'
  }

  if (filter === 'open') {
    return scholarship.status === 'Open'
  }

  if (filter === 'closed') {
    return scholarship.status === 'Closed'
  }

  return false
}

function getDetailMessage(detail: unknown): string | null {
  if (typeof detail === 'string') {
    return detail
  }

  if (Array.isArray(detail)) {
    const messages = detail.filter(
      (item): item is string => typeof item === 'string',
    )

    return messages.length > 0 ? messages.join(' ') : null
  }

  if (detail && typeof detail === 'object' && 'detail' in detail) {
    return getDetailMessage((detail as ApiErrorBody).detail)
  }

  return null
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return (
      getDetailMessage(error.response?.data?.detail) ??
      'Nao foi possivel concluir a solicitacao.'
    )
  }

  return 'Nao foi possivel concluir a solicitacao.'
}

export default function ScholarshipsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<ScholarshipFilter>('all')
  const isTeacher = isTeacherRole(user?.role)

  const scholarshipsQuery = useQuery({
    queryKey: ['scholarships', 'list'],
    queryFn: () =>
      listScholarships({
        ordering: 'registration_end',
        pageSize: 50,
      }),
  })

  const scholarships = scholarshipsQuery.data?.items ?? emptyScholarships
  const normalizedSearch = normalizeText(search)

  const orderedScholarships = useMemo(() => {
    return scholarships
      .filter((scholarship) => scholarship.status !== 'Draft')
      .toSorted((current, next) => {
        const statusDifference =
          statusOrder[current.status] - statusOrder[next.status]

        if (statusDifference !== 0) {
          return statusDifference
        }

        const currentDate = current.registrationEnd ?? current.createdAt
        const nextDate = next.registrationEnd ?? next.createdAt

        return currentDate.localeCompare(nextDate)
      })
  }, [scholarships])

  const filteredScholarships = useMemo(() => {
    return orderedScholarships.filter((scholarship) => {
      const passesFilter = matchesFilter(
        scholarship,
        selectedFilter,
      )
      const passesSearch =
        !normalizedSearch ||
        getScholarshipText(scholarship).includes(normalizedSearch)

      return passesFilter && passesSearch
    })
  }, [
    normalizedSearch,
    orderedScholarships,
    selectedFilter,
  ])

  return (
    <section className="scholarships-page">
      <header className="scholarships-page__header">
        <div className="scholarships-page__intro">
          <span className="scholarships-page__eyebrow">
            Pesquisa, Inovação e Extensão
          </span>
          <h1>Bolsas de P&D</h1>
          <p>
            Editais ativos do IFRN. Acompanhe prazos, requisitos e candidate-se
            direto na plataforma.
          </p>
        </div>

        {isTeacher ? (
          <Button
            className="scholarships-page__create-button"
            iconLeft={Plus}
            onClick={() => navigate('/bolsas/nova')}
            size="lg"
          >
            Criar bolsa
          </Button>
        ) : null}
      </header>

      <div className="scholarships-page__toolbar">
        <label className="scholarships-page__search">
          <Search aria-hidden="true" size={18} strokeWidth={1.9} />
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por título, descrição ou tecnologia..."
            type="search"
            value={search}
          />
        </label>

        <div className="scholarships-page__filters" aria-label="Filtros">
          {filters.map((filter) => (
            <FilterTag
              active={selectedFilter === filter.id}
              iconLeft={selectedFilter === filter.id ? Circle : undefined}
              key={filter.id}
              label={filter.label}
              onClick={() => setSelectedFilter(filter.id)}
            />
          ))}
        </div>
      </div>

      {scholarshipsQuery.isLoading ? (
        <LoadingState
          message="Carregando bolsas"
          skeletonCount={3}
          variant="skeleton"
        />
      ) : scholarshipsQuery.isError ? (
        <ErrorState
          message={getErrorMessage(scholarshipsQuery.error)}
          onRetry={() => scholarshipsQuery.refetch()}
        />
      ) : filteredScholarships.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="Nenhuma bolsa encontrada"
          description="Ajuste os filtros ou a busca para encontrar outros editais."
        />
      ) : (
        <div className="scholarships-page__list">
          {filteredScholarships.map((scholarship) => (
            <ScholarshipCard
              key={scholarship.id}
              scholarship={scholarship}
            />
          ))}
        </div>
      )}
    </section>
  )
}
