import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Circle, ClipboardList, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { FilterTag } from '../../../components/atoms/FilterTag'
import { ScholarshipCard } from '../../../components/molecules/ScholarshipCard'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../../components/states'
import {
  getScholarship,
  listScholarshipApplications,
  type ScholarshipApplication,
} from '../../../services/scholarships'
import type {
  Scholarship,
  ScholarshipApplicationStatus,
} from '../../../types/scholarships'
import '../ScholarshipsPage.css'

type ApplicationFilter = 'all' | ScholarshipApplicationStatus

interface ApplicationFilterOption {
  id: ApplicationFilter
  label: string
}

interface ApplicationScholarshipItem {
  application: ScholarshipApplication
  scholarship: Scholarship
}

interface ApiErrorBody {
  detail?: unknown
}

const filters: ApplicationFilterOption[] = [
  { id: 'all', label: 'Todas' },
  { id: 'Enrolled', label: 'Inscrito' },
  { id: 'Approved', label: 'Aprovadas' },
  { id: 'Rejected', label: 'Reprovadas' },
  { id: 'Cancelled', label: 'Canceladas' },
]

const applicationStatusLabels: Record<ScholarshipApplicationStatus, string> = {
  Approved: 'Aprovada',
  Cancelled: 'Cancelada',
  Enrolled: 'Inscrito',
  Rejected: 'Reprovada',
}

const emptyApplications: ApplicationScholarshipItem[] = []

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function getApplicationText(item: ApplicationScholarshipItem) {
  const { application, scholarship } = item
  const statusLabel = applicationStatusLabels[application.status]

  return normalizeText(
    [
      statusLabel,
      scholarship.title,
      scholarship.description,
      scholarship.activityDescription,
      ...scholarship.technologies.map((technology) => technology.name),
    ].join(' '),
  )
}

function matchesFilter(
  application: ScholarshipApplication,
  filter: ApplicationFilter,
) {
  return filter === 'all' || application.status === filter
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
      'Não foi possível carregar suas candidaturas.'
    )
  }

  return 'Não foi possível carregar suas candidaturas.'
}

async function listMyApplicationScholarships() {
  const applicationsResult = await listScholarshipApplications({
    ordering: '-applied_at',
    pageSize: 100,
  })

  const applications = applicationsResult.items

  if (applications.length === 0) {
    return emptyApplications
  }

  return Promise.all(
    applications.map(async (application) => ({
      application,
      scholarship: await getScholarship(application.scholarship),
    })),
  )
}

export default function MyApplicationsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<ApplicationFilter>('all')

  const applicationsQuery = useQuery({
    queryKey: ['scholarships', 'applications', 'my'],
    queryFn: listMyApplicationScholarships,
  })

  const applications = applicationsQuery.data ?? emptyApplications
  const normalizedSearch = normalizeText(search)

  const filteredApplications = useMemo(() => {
    return applications.filter((item) => {
      const passesFilter = matchesFilter(item.application, selectedFilter)
      const passesSearch =
        !normalizedSearch || getApplicationText(item).includes(normalizedSearch)

      return passesFilter && passesSearch
    })
  }, [applications, normalizedSearch, selectedFilter])

  return (
    <section className="scholarships-page my-applications-page">
      <header className="scholarships-page__header">
        <div className="scholarships-page__intro">
          <span className="scholarships-page__eyebrow">
            Acompanhamento do aluno
          </span>
          <h1>Minhas candidaturas</h1>
          <p>
            Consulte as bolsas em que você se inscreveu e acompanhe o andamento
            de cada processo seletivo.
          </p>
        </div>
      </header>

      <div className="scholarships-page__toolbar">
        <label className="scholarships-page__search">
          <Search aria-hidden="true" size={18} strokeWidth={1.9} />
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por bolsa, tecnologia ou status..."
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

      {applicationsQuery.isLoading ? (
        <LoadingState
          message="Carregando candidaturas"
          skeletonCount={3}
          variant="skeleton"
        />
      ) : applicationsQuery.isError ? (
        <ErrorState
          message={getErrorMessage(applicationsQuery.error)}
          onRetry={() => applicationsQuery.refetch()}
        />
      ) : applications.length === 0 ? (
        <EmptyState
          actionLabel="Ver bolsas disponíveis"
          description="Quando você se candidatar a uma bolsa, ela aparecerá aqui com o status da sua inscrição."
          icon={ClipboardList}
          onAction={() => navigate('/bolsas')}
          title="Você ainda não possui candidaturas"
        />
      ) : filteredApplications.length === 0 ? (
        <EmptyState
          description="Ajuste a busca ou os filtros para encontrar outras candidaturas."
          icon={ClipboardList}
          title="Nenhuma candidatura encontrada"
        />
      ) : (
        <div className="scholarships-page__list">
          {filteredApplications.map(({ application, scholarship }) => (
            <ScholarshipCard
              application={{
                appliedAt: application.appliedAt,
                status: application.status,
              }}
              key={application.id}
              scholarship={scholarship}
            />
          ))}
        </div>
      )}
    </section>
  )
}
