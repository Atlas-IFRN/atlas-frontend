import { useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ClipboardList,
  Search,
  UserCheck,
  UserX,
  XCircle,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '../../../components/atoms/Avatar'
import { Button } from '../../../components/atoms/Button'
import { FilterTag } from '../../../components/atoms/FilterTag'
import { StatCard } from '../../../components/atoms/StatCard'
import { StatusBadge } from '../../../components/atoms/StatusBadge'
import {
  TechIcon,
  TechTag,
  techIconColors,
  type TechIconName,
  type TechTagCategory,
} from '../../../components/atoms/TechTag'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../../components/states'
import {
  approveScholarshipApplication,
  getScholarship,
  listScholarshipApplications,
  rejectScholarshipApplication,
  type ScholarshipApplication,
} from '../../../services/scholarships'
import type {
  ScholarshipApplicationStatus,
} from '../../../types/scholarships'
import '../ScholarshipsPage.css'
import './ScholarshipApplicationsPage.css'

type ApplicationFilter = 'all' | ScholarshipApplicationStatus
type ApplicationDecision = 'approve' | 'reject'

interface ApplicationFilterOption {
  id: ApplicationFilter
  label: string
}

interface ApplicationDecisionVariables {
  applicationId: string
  decision: ApplicationDecision
}

interface DecisionConfirmation {
  application: ScholarshipApplication
  decision: ApplicationDecision
}

interface ApiErrorBody {
  detail?: unknown
}

const filters: ApplicationFilterOption[] = [
  { id: 'all', label: 'Todos' },
  { id: 'Enrolled', label: 'Aguardando' },
  { id: 'Approved', label: 'Aprovadas' },
  { id: 'Rejected', label: 'Reprovadas' },
  { id: 'Cancelled', label: 'Canceladas' },
]

const applicationStatusLabels: Record<ScholarshipApplicationStatus, string> = {
  Approved: 'Aprovada',
  Cancelled: 'Cancelada',
  Enrolled: 'Aguardando',
  Rejected: 'Reprovada',
}

const applicationStatusBadge: Record<
  ScholarshipApplicationStatus,
  'approved' | 'neutral' | 'rejected' | 'warning'
> = {
  Approved: 'approved',
  Cancelled: 'neutral',
  Enrolled: 'warning',
  Rejected: 'rejected',
}

const technologyMetaByName: Record<
  string,
  { category: TechTagCategory; icon: TechIconName }
> = {
  angular: { category: 'framework', icon: 'angular' },
  c: { category: 'language', icon: 'c' },
  'c++': { category: 'language', icon: 'c-plus-plus' },
  docker: { category: 'infra', icon: 'docker' },
  figma: { category: 'tool', icon: 'figma' },
  git: { category: 'tool', icon: 'git' },
  go: { category: 'language', icon: 'go' },
  java: { category: 'language', icon: 'java' },
  kubernetes: { category: 'infra', icon: 'kubernetes' },
  mongodb: { category: 'infra', icon: 'mongodb' },
  'mongo db': { category: 'infra', icon: 'mongodb' },
  mqtt: { category: 'tool', icon: 'apache-kafka' },
  'next.js': { category: 'framework', icon: 'nextjs' },
  nextjs: { category: 'framework', icon: 'nextjs' },
  'node.js': { category: 'framework', icon: 'nodejs' },
  nodejs: { category: 'framework', icon: 'nodejs' },
  postgresql: { category: 'infra', icon: 'postgresql' },
  postgres: { category: 'infra', icon: 'postgresql' },
  postman: { category: 'tool', icon: 'postman' },
  python: { category: 'language', icon: 'python' },
  'raspberry pi': { category: 'infra', icon: 'raspberry-pi' },
  react: { category: 'framework', icon: 'react' },
  redis: { category: 'infra', icon: 'redis' },
  rust: { category: 'language', icon: 'rust' },
  spring: { category: 'framework', icon: 'spring' },
  tensorflow: { category: 'framework', icon: 'tensorflow' },
  typescript: { category: 'language', icon: 'typescript' },
  vite: { category: 'tool', icon: 'vite' },
  vue: { category: 'framework', icon: 'vue' },
}

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  month: 'short',
})

const emptyApplications: ScholarshipApplication[] = []

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
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
      'Não foi possível carregar as candidaturas desta bolsa.'
    )
  }

  return 'Não foi possível carregar as candidaturas desta bolsa.'
}

function getActionErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return (
      getDetailMessage(error.response?.data?.detail) ??
      'Não foi possível atualizar esta candidatura.'
    )
  }

  return 'Não foi possível atualizar esta candidatura.'
}

function formatDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Data indisponível'
  }

  return dateTimeFormatter.format(date).replace('.', '')
}

function formatIra(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return 'Não informado'
  }

  return value.toLocaleString('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 1,
  })
}

function formatPeriod(value: number | null | undefined) {
  if (value === null || value === undefined || value <= 0) {
    return 'Não informado'
  }

  return `${value}º período`
}

function getTechnologyMeta(name: string) {
  return technologyMetaByName[name.trim().toLowerCase()]
}

function getShortId(value: string, length = 8) {
  return value.slice(0, length).toUpperCase()
}

function getCandidateName(application: ScholarshipApplication) {
  return (
    application.student?.fullName ||
    application.student?.firstName ||
    (application.student?.matricula
      ? `Aluno ${application.student.matricula}`
      : `Aluno ${getShortId(application.studentId)}`)
  )
}

function getCandidateMatricula(application: ScholarshipApplication) {
  return application.student?.matricula || 'Matrícula não informada'
}

function getCandidateAcademicSummary(application: ScholarshipApplication) {
  return `IRA ${formatIra(application.student?.ira)} · ${formatPeriod(
    application.student?.period,
  )}`
}

function getCandidateProfilePath(application: ScholarshipApplication) {
  return `/perfis/${application.student?.id || application.studentId}`
}

function getCandidateSearchText(application: ScholarshipApplication) {
  const student = application.student

  return normalizeText(
    [
      getCandidateName(application),
      student?.matricula ?? '',
      student?.courseName ?? '',
      student?.institutionName ?? '',
      student?.ira?.toString() ?? '',
      student?.period?.toString() ?? '',
      application.id,
      application.studentId,
      applicationStatusLabels[application.status],
      application.status,
    ].join(' '),
  )
}

function getFirstSentence(text: string) {
  const trimmedText = text.trim()

  if (!trimmedText) {
    return 'Acompanhe as candidaturas recebidas e avance com a seleção da bolsa.'
  }

  const [firstSentence] = trimmedText.split(/(?<=[.!?])\s+/)

  return firstSentence || trimmedText
}

function getApplicationsByStatus(applications: ScholarshipApplication[]) {
  return applications.reduce(
    (accumulator, application) => {
      accumulator[application.status] += 1
      return accumulator
    },
    {
      Approved: 0,
      Cancelled: 0,
      Enrolled: 0,
      Rejected: 0,
    } satisfies Record<ScholarshipApplicationStatus, number>,
  )
}

function matchesFilter(
  application: ScholarshipApplication,
  filter: ApplicationFilter,
) {
  return filter === 'all' || application.status === filter
}

function stopCardNavigation(event: MouseEvent<HTMLElement>) {
  event.stopPropagation()
}

async function listApplicationsByScholarship(scholarshipId: string) {
  const result = await listScholarshipApplications({
    ordering: '-applied_at',
    pageSize: 200,
    scholarship: scholarshipId,
  })

  return result.items.filter(
    (application) => application.scholarship === scholarshipId,
  )
}

export default function ScholarshipApplicationsPage() {
  const { scholarshipId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<ApplicationFilter>('all')
  const [decisionConfirmation, setDecisionConfirmation] =
    useState<DecisionConfirmation | null>(null)

  const scholarshipQuery = useQuery({
    queryKey: ['scholarships', 'detail', scholarshipId],
    queryFn: () => {
      if (!scholarshipId) {
        throw new Error('Bolsa não informada.')
      }

      return getScholarship(scholarshipId)
    },
    enabled: Boolean(scholarshipId),
  })

  const applicationsQuery = useQuery({
    queryKey: ['scholarships', 'applications', 'by-scholarship', scholarshipId],
    queryFn: () => {
      if (!scholarshipId) {
        throw new Error('Bolsa não informada.')
      }

      return listApplicationsByScholarship(scholarshipId)
    },
    enabled: Boolean(scholarshipId),
  })

  const decisionMutation = useMutation({
    mutationFn: ({ applicationId, decision }: ApplicationDecisionVariables) =>
      decision === 'approve'
        ? approveScholarshipApplication(applicationId)
        : rejectScholarshipApplication(applicationId),
    onSuccess: () => {
      setDecisionConfirmation(null)
      queryClient.invalidateQueries({
        queryKey: [
          'scholarships',
          'applications',
          'by-scholarship',
          scholarshipId,
        ],
      })
      queryClient.invalidateQueries({
        queryKey: ['scholarships', 'applications'],
      })
      queryClient.invalidateQueries({
        queryKey: ['scholarships', 'detail', scholarshipId],
      })
    },
  })

  const scholarship = scholarshipQuery.data
  const applications = applicationsQuery.data ?? emptyApplications
  const applicationsByStatus = useMemo(
    () => getApplicationsByStatus(applications),
    [applications],
  )
  const normalizedSearch = normalizeText(search)
  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const passesFilter = matchesFilter(application, selectedFilter)
      const passesSearch =
        !normalizedSearch ||
        getCandidateSearchText(application).includes(normalizedSearch)

      return passesFilter && passesSearch
    })
  }, [applications, normalizedSearch, selectedFilter])
  const approvedRatio = scholarship?.vacancies
    ? Math.min(100, (applicationsByStatus.Approved / scholarship.vacancies) * 100)
    : 0
  const pendingActionId = decisionMutation.variables?.applicationId
  const pendingDecision = decisionMutation.variables?.decision
  const isInitialLoading =
    scholarshipQuery.isLoading || applicationsQuery.isLoading
  const isInitialError = scholarshipQuery.isError || applicationsQuery.isError

  const handleApplicationDecision = (
    application: ScholarshipApplication,
    decision: ApplicationDecision,
  ) => {
    if (application.status !== 'Enrolled' || decisionMutation.isPending) {
      return
    }

    decisionMutation.mutate({ applicationId: application.id, decision })
  }

  const handleOpenDecisionConfirmation = (
    application: ScholarshipApplication,
    decision: ApplicationDecision,
  ) => {
    if (application.status !== 'Enrolled' || decisionMutation.isPending) {
      return
    }

    setDecisionConfirmation({ application, decision })
  }

  const handleCloseDecisionConfirmation = () => {
    if (decisionMutation.isPending) {
      return
    }

    setDecisionConfirmation(null)
  }

  const handleConfirmDecision = () => {
    if (!decisionConfirmation) {
      return
    }

    handleApplicationDecision(
      decisionConfirmation.application,
      decisionConfirmation.decision,
    )
  }

  const handleCandidateKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    application: ScholarshipApplication,
  ) => {
    if (event.target !== event.currentTarget) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      navigate(getCandidateProfilePath(application))
    }
  }

  if (!scholarshipId) {
    return (
      <section className="scholarship-applications-page">
        <ErrorState
          title="Bolsa não informada"
          message="Volte para a listagem e selecione uma bolsa para abrir as candidaturas."
          action={
            <Button iconLeft={ArrowLeft} onClick={() => navigate('/bolsas')}>
              Voltar para bolsas
            </Button>
          }
        />
      </section>
    )
  }

  if (isInitialLoading) {
    return (
      <section className="scholarship-applications-page">
        <LoadingState
          message="Carregando candidaturas"
          skeletonCount={4}
          variant="skeleton"
        />
      </section>
    )
  }

  if (isInitialError || !scholarship) {
    const error = scholarshipQuery.error ?? applicationsQuery.error

    return (
      <section className="scholarship-applications-page">
        <ErrorState
          message={getErrorMessage(error)}
          onRetry={() => {
            scholarshipQuery.refetch()
            applicationsQuery.refetch()
          }}
        />
      </section>
    )
  }

  return (
    <section className="scholarship-applications-page">
      <header className="scholarship-applications-hero">
        <div className="scholarship-applications-hero__nav">
          <Button
            iconLeft={ArrowLeft}
            onClick={() => navigate(`/bolsas/${scholarship.id}`)}
            size="sm"
            variant="ghost"
          >
            Voltar
          </Button>

          <span className="scholarship-applications-hero__status">
            {applications.length} candidatura
            {applications.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="scholarship-applications-hero__content">
          <span className="scholarships-page__eyebrow">
            Gestão de candidaturas
          </span>
          <h1>{scholarship.title}</h1>
          <p>{getFirstSentence(scholarship.description)}</p>
        </div>

        <div className="scholarship-applications-hero__footer">
          <div className="scholarship-applications-progress">
            <div>
              <span>Selecionados</span>
              <strong>
                {applicationsByStatus.Approved}/{scholarship.vacancies}
              </strong>
            </div>
            <span
              className="scholarship-applications-progress__bar"
              aria-hidden="true"
            >
              <span style={{ inlineSize: `${approvedRatio}%` }} />
            </span>
          </div>

          {scholarship.technologies.length > 0 ? (
            <ul
              className="scholarship-applications-hero__tags"
              aria-label="Tecnologias da bolsa"
            >
              {scholarship.technologies.slice(0, 5).map((technology) => {
                const meta = getTechnologyMeta(technology.name)

                return (
                  <li key={technology.id}>
                    <TechTag
                      accentColor={
                        meta ? techIconColors[meta.icon] : undefined
                      }
                      category={meta?.category ?? 'tool'}
                      icon={meta ? <TechIcon name={meta.icon} /> : undefined}
                      variant="solid"
                    >
                      {technology.name}
                    </TechTag>
                  </li>
                )
              })}
            </ul>
          ) : null}
        </div>
      </header>

      <section className="scholarship-applications-overview">
        <StatCard
          icon={ClipboardList}
          label="Pendentes"
          tone="amber"
          value={applicationsByStatus.Enrolled}
        />
        <StatCard
          icon={UserCheck}
          label="Aprovadas"
          tone="teal"
          value={applicationsByStatus.Approved}
        />
        <StatCard
          icon={UserX}
          label="Reprovadas"
          tone="primary"
          value={applicationsByStatus.Rejected}
        />
        <StatCard
          icon={XCircle}
          label="Canceladas"
          tone="purple"
          value={applicationsByStatus.Cancelled}
        />
      </section>

      <div className="scholarships-page__toolbar scholarship-applications-toolbar">
        <label className="scholarships-page__search">
          <Search aria-hidden="true" size={18} strokeWidth={1.9} />
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por aluno, identificador ou status..."
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

      {decisionMutation.isError ? (
        <div className="scholarship-applications-alert" role="alert">
          <XCircle aria-hidden="true" size={18} strokeWidth={1.9} />
          <span>{getActionErrorMessage(decisionMutation.error)}</span>
        </div>
      ) : null}

      {applications.length === 0 ? (
        <EmptyState
          description="Quando alunos se inscreverem nesta bolsa, os perfis aparecerão aqui para avaliação."
          icon={ClipboardList}
          title="Nenhuma candidatura recebida"
        />
      ) : filteredApplications.length === 0 ? (
        <EmptyState
          description="Ajuste a busca ou os filtros para encontrar outras candidaturas desta bolsa."
          icon={Search}
          title="Nenhum candidato encontrado"
        />
      ) : (
        <div className="scholarship-applications-list">
          {filteredApplications.map((application) => {
            const candidateName = getCandidateName(application)
            const canDecide = application.status === 'Enrolled'
            const isApproving =
              decisionMutation.isPending &&
              pendingActionId === application.id &&
              pendingDecision === 'approve'
            const isRejecting =
              decisionMutation.isPending &&
              pendingActionId === application.id &&
              pendingDecision === 'reject'

            return (
              <article
                aria-label={`Abrir perfil de ${candidateName}`}
                className="scholarship-candidate-card"
                data-status={application.status}
                key={application.id}
                onClick={() => navigate(getCandidateProfilePath(application))}
                onKeyDown={(event) =>
                  handleCandidateKeyDown(event, application)
                }
                role="link"
                tabIndex={0}
              >
                <div className="scholarship-candidate-card__identity">
                  <Avatar
                    color="blue"
                    name={candidateName}
                    size="lg"
                  />

                  <div>
                    <div className="scholarship-candidate-card__title-row">
                      <h2>{candidateName}</h2>
                      <StatusBadge
                        size="sm"
                        status={applicationStatusBadge[application.status]}
                      >
                        {applicationStatusLabels[application.status]}
                      </StatusBadge>
                    </div>

                    <p>
                      <span>{getCandidateMatricula(application)}</span>
                      <small>{getCandidateAcademicSummary(application)}</small>
                    </p>
                  </div>
                </div>

                <dl className="scholarship-candidate-card__details">
                  <div>
                    <dt>
                      Inscreveu-se em
                    </dt>
                    <dd>{formatDateTime(application.updatedAt)}</dd>
                  </div>
                </dl>

                <div
                  className="scholarship-candidate-card__actions"
                  onClick={stopCardNavigation}
                >
                  <Button
                    onClick={() => navigate(getCandidateProfilePath(application))}
                    size="sm"
                    variant="outline"
                  >
                    Ver perfil
                  </Button>

                  <Button
                    disabled={!canDecide || decisionMutation.isPending}
                    iconLeft={CheckCircle2}
                    loading={isApproving}
                    onClick={() =>
                      handleOpenDecisionConfirmation(application, 'approve')
                    }
                    size="sm"
                    variant="soft"
                  >
                    Aprovar
                  </Button>

                  <Button
                    disabled={!canDecide || decisionMutation.isPending}
                    iconLeft={XCircle}
                    loading={isRejecting}
                    onClick={() =>
                      handleOpenDecisionConfirmation(application, 'reject')
                    }
                    size="sm"
                    variant="danger"
                  >
                    Reprovar
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {decisionConfirmation ? (
        <div className="scholarship-application-decision-modal" role="presentation">
          <section
            aria-describedby="application-decision-description"
            aria-labelledby="application-decision-title"
            aria-modal="true"
            className="scholarship-application-decision-modal__dialog"
            role="alertdialog"
          >
            <div>
              <span
                className="scholarship-application-decision-modal__icon"
                data-decision={decisionConfirmation.decision}
                aria-hidden="true"
              >
                {decisionConfirmation.decision === 'approve' ? (
                  <CheckCircle2 size={22} strokeWidth={2.2} />
                ) : (
                  <XCircle size={22} strokeWidth={2.2} />
                )}
              </span>
              <div>
                <h2 id="application-decision-title">
                  {decisionConfirmation.decision === 'approve'
                    ? 'Aprovar candidatura?'
                    : 'Reprovar candidatura?'}
                </h2>
                <p id="application-decision-description">
                  Esta ação não poderá ser desfeita. Confirme apenas se a
                  decisão sobre {getCandidateName(decisionConfirmation.application)}
                  {' '}estiver correta.
                </p>
              </div>
            </div>

            <div className="scholarship-application-decision-modal__actions">
              <Button
                disabled={decisionMutation.isPending}
                onClick={handleCloseDecisionConfirmation}
                variant="outline"
              >
                Voltar
              </Button>
              <Button
                loading={decisionMutation.isPending}
                onClick={handleConfirmDecision}
                variant={
                  decisionConfirmation.decision === 'approve'
                    ? 'soft'
                    : 'danger'
                }
              >
                {decisionConfirmation.decision === 'approve'
                  ? 'Confirmar aprovação'
                  : 'Confirmar reprovação'}
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  )
}
