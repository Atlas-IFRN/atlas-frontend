import { useMemo, useState, type CSSProperties } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  ExternalLink,
  Link2,
  Pencil,
  UserRound,
  Users,
  XCircle,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/atoms/Button'
import {
  TechIcon,
  TechTag,
  techIconColors,
  type TechIconName,
  type TechTagCategory,
} from '../../components/atoms/TechTag'
import { EmptyState, ErrorState, LoadingState } from '../../components/states'
import {
  applyToScholarship,
  cancelScholarshipApplication,
  getScholarship,
} from '../../services/scholarships'
import type {
  Scholarship,
  ScholarshipPhase,
  ScholarshipPhaseType,
  ScholarshipStatus,
} from '../../types/scholarships'
import './ScholarshipDetailsPage.css'

export default function ScholarshipDetailsPage() {
  const { scholarshipId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedTab, setSelectedTab] = useState<DetailTab>('about')
  const [expandedRequirements, setExpandedRequirements] = useState<Set<string>>(
    () => new Set(),
  )
  const [calendarMonth, setCalendarMonth] = useState<Date | null>(null)
  const [cancelConfirmationOpen, setCancelConfirmationOpen] = useState(false)

  const scholarshipQuery = useQuery({
    queryKey: ['scholarships', 'detail', scholarshipId],
    queryFn: () => {
      if (!scholarshipId) {
        throw new Error('Bolsa nao informada.')
      }

      return getScholarship(scholarshipId)
    },
    enabled: Boolean(scholarshipId),
  })

  const applyMutation = useMutation({
    mutationFn: () => applyToScholarship(scholarshipId ?? ''),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['scholarships', 'detail', scholarshipId],
      })
      queryClient.invalidateQueries({ queryKey: ['scholarships', 'list'] })
      queryClient.invalidateQueries({
        queryKey: ['scholarships', 'applications', 'my'],
      })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelScholarshipApplication(scholarshipId ?? ''),
    onSuccess: () => {
      setCancelConfirmationOpen(false)
      queryClient.invalidateQueries({
        queryKey: ['scholarships', 'detail', scholarshipId],
      })
      queryClient.invalidateQueries({ queryKey: ['scholarships', 'list'] })
      queryClient.invalidateQueries({
        queryKey: ['scholarships', 'applications', 'my'],
      })
    },
  })

  const scholarship = scholarshipQuery.data
  const isStudent = isStudentRole(user?.role)
  const isTeacher = isTeacherRole(user?.role)
  const sortedPhases = useMemo(
    () => sortPhases(scholarship?.phases ?? []),
    [scholarship?.phases],
  )
  const defaultCalendarPhase = useMemo(
    () => getDefaultPhase(sortedPhases),
    [sortedPhases],
  )
  const visibleMonth = useMemo(() => {
    if (calendarMonth) {
      return calendarMonth
    }

    const phaseDate = defaultCalendarPhase
      ? (parseDate(defaultCalendarPhase.endDate) ??
        parseDate(defaultCalendarPhase.startDate))
      : null

    return startOfMonth(phaseDate ?? new Date())
  }, [calendarMonth, defaultCalendarPhase])
  const calendarDays = useMemo(
    () => getCalendarDays(visibleMonth),
    [visibleMonth],
  )
  const phaseDateAccentByDate = useMemo(
    () => getPhaseDateAccentByDate(sortedPhases),
    [sortedPhases],
  )
  const displayRequirements = useMemo(
    () => (scholarship ? getDisplayRequirements(scholarship) : []),
    [scholarship],
  )
  const orderedLinks = useMemo(
    () =>
      (scholarship?.links ?? []).toSorted(
        (current, next) => current.displayOrder - next.displayOrder,
      ),
    [scholarship?.links],
  )

  function toggleRequirement(requirementId: string) {
    setExpandedRequirements((current) => {
      const next = new Set(current)

      if (next.has(requirementId)) {
        next.delete(requirementId)
      } else {
        next.add(requirementId)
      }

      return next
    })
  }

  if (!scholarshipId) {
    return (
      <section className="scholarship-detail-page">
        <ErrorState
          title="Bolsa não informada"
          message="Volte para a listagem e selecione uma bolsa para abrir os detalhes."
          action={
            <Button iconLeft={ArrowLeft} onClick={() => navigate('/bolsas')}>
              Voltar para bolsas
            </Button>
          }
        />
      </section>
    )
  }

  if (scholarshipQuery.isLoading) {
    return (
      <section className="scholarship-detail-page">
        <LoadingState
          message="Carregando detalhes da bolsa"
          skeletonCount={3}
          variant="skeleton"
        />
      </section>
    )
  }

  if (scholarshipQuery.isError || !scholarship) {
    return (
      <section className="scholarship-detail-page">
        <ErrorState
          message={getErrorMessage(scholarshipQuery.error)}
          onRetry={() => scholarshipQuery.refetch()}
        />
      </section>
    )
  }

  const application = scholarship.userApplication
  const registrationDeadlineExceeded =
    hasRegistrationDeadlineEnded(scholarship)
  const canApply =
    isStudent &&
    scholarship.status === 'Open' &&
    !application?.applied &&
    !registrationDeadlineExceeded
  const canCancelApplication =
    isStudent && application?.applied && application.status === 'Enrolled'
  const applyLabel = getApplyLabel(
    scholarship,
    isStudent,
    registrationDeadlineExceeded,
  )
  const editionLabel = getEditionLabel(scholarship)
  const initials = getScholarshipInitials(scholarship.title)
  const publishedBy = getPublisherLabel(scholarship, user?.id)
  const publishedAt = formatFullDate(scholarship.createdAt)
  const updatedAt = formatFullDate(scholarship.updatedAt)
  const aboutText = scholarship.description.trim()
  const activitiesText = scholarship.activityDescription.trim()
  const heroDescription = getFirstSentence(scholarship.description)
  const technologies = scholarship.technologies
  const handleApply = () => {
    if (!canApply || applyMutation.isPending) {
      return
    }

    applyMutation.mutate()
  }
  const handleOpenCancelConfirmation = () => {
    if (!canCancelApplication || cancelMutation.isPending) {
      return
    }

    setCancelConfirmationOpen(true)
  }
  const handleCloseCancelConfirmation = () => {
    if (cancelMutation.isPending) {
      return
    }

    setCancelConfirmationOpen(false)
  }
  const handleCancelApplication = () => {
    if (!canCancelApplication || cancelMutation.isPending) {
      return
    }

    cancelMutation.mutate()
  }

  return (
    <section className="scholarship-detail-page">
      <section className="scholarship-detail-hero">
        <div className="scholarship-detail-hero__mark" aria-hidden="true">
          <strong>{initials}</strong>
          <span>{editionLabel}</span>
        </div>

        <div className="scholarship-detail-hero__body">
          <div className="scholarship-detail-hero__top">

            <span
              className="scholarship-detail-status"
              data-status={scholarship.status}
            >
              {statusLabels[scholarship.status]}
            </span>
          </div>

          <div className="scholarship-detail-hero__content">
            <h1>{scholarship.title}</h1>
            <p>{heroDescription}</p>
          </div>

          <div className="scholarship-detail-hero__meta">
            <span>
              <UserRound aria-hidden="true" size={15} strokeWidth={1.9} />
              {publishedBy}
            </span>
            <span>
              <CalendarDays
                aria-hidden="true"
                size={15}
                strokeWidth={1.9}
              />
              Publicado em {publishedAt}
            </span>
            <span>
              <Pencil aria-hidden="true" size={15} strokeWidth={1.9} />
              Atualizado em {updatedAt}
            </span>
          </div>
        </div>
      </section>

      <div className="scholarship-detail-page__layout">
        <main className="scholarship-detail-page__main">
          <section className="scholarship-detail-panel scholarship-detail-tabs">
            <div
              aria-label="Seções da bolsa"
              className="scholarship-detail-tabs__list"
              role="tablist"
            >
              {detailTabs.map((tab) => (
                <button
                  aria-selected={selectedTab === tab.id}
                  className="scholarship-detail-tabs__button"
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  role="tab"
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="scholarship-detail-tabs__content" role="tabpanel">
              {selectedTab === 'about' ? (
                <p>{aboutText || 'Informações gerais não cadastradas.'}</p>
              ) : null}

              {selectedTab === 'activities' ? (
                <p>
                  {activitiesText ||
                    'As atividades desta bolsa serão detalhadas no edital.'}
                </p>
              ) : null}
            </div>
          </section>

          <section className="scholarship-detail-panel scholarship-detail-requirements">
            <header className="scholarship-detail-panel__header">
              <h2>Pré-requisitos</h2>
              <span>
                {displayRequirements.length} requisitos · clique para ver
                detalhes
              </span>
            </header>

            <div className="scholarship-detail-requirements__list">
              {displayRequirements.map((requirement) => {
                const expanded = expandedRequirements.has(requirement.id)

                return (
                  <article
                    className="scholarship-detail-requirement"
                    data-expanded={expanded || undefined}
                    key={requirement.id}
                  >
                    <button
                      aria-expanded={expanded}
                      onClick={() => toggleRequirement(requirement.id)}
                      type="button"
                    >
                      <span
                        className="scholarship-detail-requirement__bullet"
                        aria-hidden="true"
                      />
                      <strong>{requirement.title}</strong>
                      <ChevronDown
                        aria-hidden="true"
                        className="scholarship-detail-requirement__chevron"
                        size={18}
                        strokeWidth={1.9}
                      />
                    </button>

                    <div
                      className="scholarship-detail-requirement__details"
                      aria-hidden={!expanded}
                    >
                      <p>{requirement.description}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          {sortedPhases.length > 0 ? (
            <section className="scholarship-detail-timeline">
              <h2>Cronograma do processo seletivo</h2>

              <div className="scholarship-detail-timeline__grid">
                <div className="scholarship-detail-panel scholarship-detail-calendar">
                  <header>
                    <h3>{formatMonthTitle(visibleMonth)}</h3>
                    <div>
                      <Button
                        aria-label="Mes anterior"
                        iconLeft={ChevronLeft}
                        onClick={() =>
                          setCalendarMonth(addMonths(visibleMonth, -1))
                        }
                        size="sm"
                        variant="outline"
                      />
                      <Button
                        aria-label="Proximo mes"
                        iconLeft={ChevronRight}
                        onClick={() =>
                          setCalendarMonth(addMonths(visibleMonth, 1))
                        }
                        size="sm"
                        variant="outline"
                      />
                    </div>
                  </header>

                  <div
                    className="scholarship-detail-calendar__weekdays"
                    aria-hidden="true"
                  >
                    {weekdayLabels.map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>

                  <div className="scholarship-detail-calendar__days">
                    {calendarDays.map((day) => {
                      const dateKey = getDateKey(day)
                      const muted = day.getMonth() !== visibleMonth.getMonth()
                      const today = dateKey === getDateKey(new Date())
                      const phaseAccent = phaseDateAccentByDate.get(dateKey)
                      const dayStyle: CalendarDayStyle | undefined = phaseAccent
                        ? { '--calendar-day-accent': phaseAccent }
                        : undefined

                      return (
                        <span
                          aria-label={formatFullDate(day.toISOString())}
                          className="scholarship-detail-calendar__day"
                          data-muted={muted || undefined}
                          data-phase={Boolean(phaseAccent) || undefined}
                          data-today={today || undefined}
                          key={dateKey}
                          style={dayStyle}
                        >
                          {day.getDate()}
                        </span>
                      )
                    })}
                  </div>

                  <footer className="scholarship-detail-calendar__legend">
                    <span data-kind="today">hoje</span>
                  </footer>
                </div>

                <div className="scholarship-detail-phases">
                  {sortedPhases.map((phase, index) => {
                    const phaseState = getPhaseState(phase)
                    const phaseStyle: PhaseStyle = {
                      '--phase-accent': getPhaseAccent(index),
                    }

                    return (
                      <article
                        className="scholarship-detail-phase"
                        data-state={phaseState}
                        key={phase.id}
                        style={phaseStyle}
                      >
                        <span
                          className="scholarship-detail-phase__bullet"
                          aria-hidden="true"
                        >
                          {phaseState === 'completed' ? (
                            <Check size={30} strokeWidth={3} />
                          ) : null}
                        </span>
                        <span className="scholarship-detail-phase__content">
                          <strong>
                            {phase.title || phaseTypeLabels[phase.type]}
                          </strong>
                          <span>{formatPhasePeriod(phase)}</span>
                        </span>
                        <span
                          className="scholarship-detail-phase__state"
                          data-state={phaseState}
                        >
                          {phaseStateLabels[phaseState]}
                        </span>
                      </article>
                    )
                  })}
                </div>
              </div>
            </section>
          ) : null}

          {technologies.length > 0 ? (
            <section className="scholarship-detail-panel scholarship-detail-technologies">
              <h2>Tecnologias utilizadas</h2>
              <ul>
                {technologies.map((technology) => {
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
            </section>
          ) : null}
        </main>

        <aside className="scholarship-detail-page__sidebar">
          <section className="scholarship-detail-panel scholarship-detail-apply">
            <span>Bolsa mensal</span>
            <strong>
              {currencyFormatter.format(scholarship.valuePerMonth)}
            </strong>

            <dl>
              <div>
                <dt>Vagas</dt>
                <dd>{scholarship.vacancies}</dd>
              </div>
              <div>
                <dt>Duração</dt>
                <dd>{scholarship.durationInMonths} meses</dd>
              </div>
            </dl>

            {isTeacher ? (
              <div className="scholarship-detail-apply__actions">
                <Button
                  iconLeft={Users}
                  onClick={() =>
                    navigate(`/bolsas/${scholarship.id}/candidaturas`)
                  }
                  size="lg"
                >
                  Candidaturas
                </Button>
                <Button
                  iconLeft={Edit3}
                  onClick={() => navigate(`/bolsas/${scholarship.id}/editar`)}
                  size="lg"
                  variant="outline"
                >
                  Editar
                </Button>
              </div>
            ) : (
              <div className="scholarship-detail-apply__actions">
                <Button
                  disabled={!canApply}
                  loading={applyMutation.isPending}
                  onClick={handleApply}
                  size="lg"
                >
                  {applyLabel}
                </Button>

                {canCancelApplication ? (
                  <Button
                    className="scholarship-detail-apply__cancel-button"
                    disabled={cancelMutation.isPending}
                    loading={cancelMutation.isPending}
                    onClick={handleOpenCancelConfirmation}
                    size="lg"
                    variant="danger"
                  >
                    Cancelar candidatura
                  </Button>
                ) : null}
              </div>
            )}

            {applyMutation.isError ? (
              <p className="scholarship-detail-apply__error">
                {getErrorMessage(applyMutation.error)}
              </p>
            ) : null}

            {cancelMutation.isError ? (
              <p className="scholarship-detail-apply__error">
                {getErrorMessage(cancelMutation.error)}
              </p>
            ) : null}
          </section>

          <section className="scholarship-detail-panel scholarship-detail-documents">
            <h2>Links</h2>

            {orderedLinks.length > 0 ? (
              <ul>
                {orderedLinks.map((link) => (
                  <li key={link.id}>
                    <a href={link.url} rel="noreferrer" target="_blank">
                      <span
                        className="scholarship-detail-documents__icon"
                        aria-hidden="true"
                      >
                        <Link2 size={18} strokeWidth={2} />
                      </span>
                      <span>
                        <strong>{link.label}</strong>
                        <small>{getDocumentKind(link.url)}</small>
                      </span>
                      <ExternalLink size={16} strokeWidth={1.9} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                className="scholarship-detail-documents__empty"
                icon={Link2}
                title="Nenhum link"
                description="Os links ainda não foram anexados."
              />
            )}
          </section>
        </aside>
      </div>

      {cancelConfirmationOpen ? (
        <div className="scholarship-detail-cancel-modal" role="presentation">
          <section
            aria-describedby="cancel-application-description"
            aria-labelledby="cancel-application-title"
            aria-modal="true"
            className="scholarship-detail-cancel-modal__dialog"
            role="alertdialog"
          >
            <div>
              <span
                className="scholarship-detail-cancel-modal__icon"
                aria-hidden="true"
              >
                <XCircle size={22} strokeWidth={2.2} />
              </span>
              <div>
                <h2 id="cancel-application-title">Cancelar candidatura?</h2>
                <p id="cancel-application-description">
                  Sua candidatura para esta bolsa será cancelada. Você poderá se
                  candidatar novamente enquanto as inscrições estiverem abertas.
                </p>
              </div>
            </div>

            <div className="scholarship-detail-cancel-modal__actions">
              <Button
                disabled={cancelMutation.isPending}
                onClick={handleCloseCancelConfirmation}
                variant="outline"
              >
                Manter candidatura
              </Button>
              <Button
                loading={cancelMutation.isPending}
                onClick={handleCancelApplication}
                variant="danger"
              >
                Cancelar candidatura
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  )
}

type DetailTab = 'about' | 'activities'
type PhaseState = 'completed' | 'current' | 'upcoming'

type PhaseStyle = CSSProperties & {
  '--phase-accent': string
}

type CalendarDayStyle = CSSProperties & {
  '--calendar-day-accent': string
}

interface ApiErrorBody {
  detail?: unknown
}

interface DisplayRequirement {
  id: string
  title: string
  description: string
}

const detailTabs: Array<{ id: DetailTab; label: string }> = [
  { id: 'about', label: 'Sobre' },
  { id: 'activities', label: 'Atividades' },
]

const statusLabels: Record<ScholarshipStatus, string> = {
  Closed: 'Encerrada',
  Draft: 'Rascunho',
  Open: 'Vagas abertas',
  RegistrationClosed: 'Inscrições encerradas',
}

const phaseTypeLabels: Record<ScholarshipPhaseType, string> = {
  Other: 'Etapa',
  Registration: 'Inscrições',
  Result: 'Resultado',
  Selection: 'Seleção',
}

const phaseStateLabels: Record<PhaseState, string> = {
  completed: 'Concluída',
  current: 'Em andamento',
  upcoming: 'Próxima',
}

const weekdayLabels = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']

const stopWords = new Set([
  'a',
  'as',
  'com',
  'da',
  'das',
  'de',
  'do',
  'dos',
  'e',
  'em',
  'o',
  'os',
  'para',
])

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  style: 'currency',
})

const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
})

const fullDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const monthFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
})

const phaseAccentPalette = [
  '#5b9bf5',
  '#2ba383',
  '#e6a943',
  '#8273e0',
  '#d6457e',
  '#e08a7d',
]

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
  influxdb: { category: 'infra', icon: 'postgresql' },
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

function isStudentRole(role: string | undefined) {
  const normalizedRole = role?.trim().toLowerCase()

  return normalizedRole === 'student' || normalizedRole === 'aluno'
}

function isTeacherRole(role: string | undefined) {
  const normalizedRole = role?.trim().toLowerCase()

  return normalizedRole === 'teacher' || normalizedRole === 'professor'
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
      'Não foi possível concluir a solicitação.'
    )
  }

  return 'Não foi possível concluir a solicitação.'
}

function parseDate(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

function normalizeFormattedDate(value: string) {
  return value.replace('.', '')
}

function getFirstSentence(value: string) {
  const trimmedValue = value.trim()
  const firstPeriodIndex = trimmedValue.indexOf('.')

  if (firstPeriodIndex === -1) {
    return trimmedValue
  }

  return trimmedValue.slice(0, firstPeriodIndex + 1)
}

function getTechnologyMeta(name: string) {
  return technologyMetaByName[name.trim().toLowerCase()]
}

function getPhaseAccent(index: number) {
  return phaseAccentPalette[index % phaseAccentPalette.length]
}

function formatShortDate(date: Date) {
  return normalizeFormattedDate(shortDateFormatter.format(date))
}

function formatFullDate(value: string | null | undefined) {
  const date = parseDate(value)

  if (!date) {
    return 'Não informado'
  }

  return normalizeFormattedDate(fullDateFormatter.format(date))
}

function formatMonthTitle(date: Date) {
  const label = monthFormatter.format(date)

  return label.charAt(0).toUpperCase() + label.slice(1)
}

function formatDecimal(value: number) {
  return value.toLocaleString('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 1,
  })
}

function sameCalendarDay(current: Date, next: Date) {
  return getDateKey(current) === getDateKey(next)
}

function sameCalendarMonth(current: Date, next: Date) {
  return (
    current.getFullYear() === next.getFullYear() &&
    current.getMonth() === next.getMonth()
  )
}

function formatPhasePeriod(phase: ScholarshipPhase) {
  const start = parseDate(phase.startDate)
  const end = parseDate(phase.endDate)

  if (!start || !end) {
    return 'Período não informado'
  }

  if (sameCalendarDay(start, end)) {
    return formatShortDate(start)
  }

  if (sameCalendarMonth(start, end)) {
    return `${formatShortDate(start)} - ${formatShortDate(end)}`
  }

  return `${formatFullDate(phase.startDate)} - ${formatFullDate(phase.endDate)}`
}

function sortPhases(phases: ScholarshipPhase[]) {
  return phases.toSorted((current, next) => {
    const orderDifference = current.displayOrder - next.displayOrder

    if (orderDifference !== 0) {
      return orderDifference
    }

    return current.startDate.localeCompare(next.startDate)
  })
}

function getPhaseState(phase: ScholarshipPhase): PhaseState {
  const now = Date.now()
  const start = parseDate(phase.startDate)?.getTime() ?? now
  const end = parseDate(phase.endDate)?.getTime() ?? start

  if (end < now) {
    return 'completed'
  }

  if (start <= now && now <= end) {
    return 'current'
  }

  return 'upcoming'
}

function getDefaultPhase(phases: ScholarshipPhase[]) {
  return (
    phases.find((phase) => getPhaseState(phase) === 'current') ??
    phases.find((phase) => getPhaseState(phase) === 'upcoming') ??
    phases.at(-1) ??
    null
  )
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

function getDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getCalendarDays(monthDate: Date) {
  const firstDay = startOfMonth(monthDate)
  const weekOffset = (firstDay.getDay() + 6) % 7
  const firstCalendarDay = new Date(
    firstDay.getFullYear(),
    firstDay.getMonth(),
    firstDay.getDate() - weekOffset,
  )

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstCalendarDay)
    date.setDate(firstCalendarDay.getDate() + index)

    return date
  })
}

function getPhaseDateKeys(phase: ScholarshipPhase) {
  const keys = new Set<string>()
  const start = parseDate(phase.startDate)
  const end = parseDate(phase.endDate) ?? start

  if (!start || !end) {
    return keys
  }

  const cursor = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  )
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate())

  while (cursor <= last && keys.size < 370) {
    keys.add(getDateKey(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return keys
}

function getPhaseDateAccentByDate(phases: ScholarshipPhase[]) {
  const accentByDate = new Map<string, string>()

  phases.forEach((phase, index) => {
    const accent = getPhaseAccent(index)

    getPhaseDateKeys(phase).forEach((dateKey) => {
      accentByDate.set(dateKey, accent)
    })
  })

  return accentByDate
}

function getDisplayRequirements(
  scholarship: Scholarship,
): DisplayRequirement[] {
  const minimumIra = formatDecimal(scholarship.minimumIra)
  const baseRequirements: DisplayRequirement[] = [
    {
      id: 'minimum-ira',
      title: `IRA mínimo ${minimumIra}`,
      description: `O candidato deve possuir IRA igual ou superior a ${minimumIra}.`,
    },
    {
      id: 'minimum-period',
      title: `${scholarship.minimumPeriod}º período ou superior`,
      description: `A bolsa exige matrícula no mínimo no ${scholarship.minimumPeriod}º período do curso.`,
    },
  ]
  const registeredRequirements = scholarship.requirements
    .toSorted((current, next) => current.displayOrder - next.displayOrder)
    .map((requirement) => ({
      id: requirement.id,
      title: requirement.title,
      description: requirement.description,
    }))

  return [...baseRequirements, ...registeredRequirements]
}

function getScholarshipInitials(title: string) {
  const words = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-zA-Z0-9]+/)
    .map((word) => word.trim().toLowerCase())
    .filter((word) => word.length > 0 && !stopWords.has(word))

  const initials = words
    .slice(0, 4)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()

  return initials || title.slice(0, 4).toUpperCase() || 'ATLS'
}

function getEditionLabel(scholarship: Scholarship) {
  const referenceDate =
    parseDate(scholarship.registrationEnd) ??
    parseDate(scholarship.createdAt) ??
    new Date()
  const semester = referenceDate.getMonth() < 6 ? 1 : 2

  return `Edital ${referenceDate.getFullYear()}.${semester}`
}

function getPublisherLabel(
  scholarship: Scholarship,
  currentUserId: string | undefined,
) {
  if (currentUserId && scholarship.publishedBy === currentUserId) {
    return 'Publicado por você'
  }

  return `Publicado por ${scholarship.publishedBy.slice(0, 8)}`
}

function hasRegistrationDeadlineEnded(scholarship: Scholarship) {
  const deadline = parseDate(scholarship.registrationEnd)

  return deadline ? Date.now() > deadline.getTime() : false
}

function getApplyLabel(
  scholarship: Scholarship,
  isStudent: boolean,
  registrationDeadlineExceeded: boolean,
) {
  const application = scholarship.userApplication

  if (application?.applied) {
    if (application.status === 'Approved') {
      return 'Candidatura aprovada'
    }

    if (application.status === 'Rejected') {
      return 'Candidatura reprovada'
    }

    return 'Candidatura enviada'
  }

  if (!isStudent) {
    return 'Acesso de estudante'
  }

  if (scholarship.status !== 'Open' || registrationDeadlineExceeded) {
    return 'Inscrições encerradas'
  }

  return 'Candidatar-se'
}

function getDocumentKind(url: string) {
  const cleanUrl = url.split('?')[0]?.toLowerCase() ?? ''
  const extension = cleanUrl.match(/\.([a-z0-9]+)$/)?.[1]

  if (!extension) {
    return 'Link externo'
  }

  return extension.toUpperCase()
}
