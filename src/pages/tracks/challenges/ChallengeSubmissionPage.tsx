import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
} from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Clock3,
  ExternalLink,
  FileCheck2,
  GitBranch,
  History,
  Layers3,
  LoaderCircle,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  XCircle,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../../../components/atoms/Button'
import { ButtonLink } from '../../../components/atoms/ButtonLink'
import { StatusBadge } from '../../../components/atoms/StatusBadge'
import {
  TechIcon,
  TechTag,
  type TechIconName,
} from '../../../components/atoms/TechTag'
import { InfoCard } from '../../../components/molecules/InfoCard'
import { ErrorState, LoadingState } from '../../../components/states'
import { getUserProfileById } from '../../../services/auth'
import {
  createChallengeSubmission,
  getChallengeSubmissions,
  getContentById,
  getModuleById,
  getMyTrackEnrollment,
  getTrackApiById,
  getTrackRequestErrorMessage,
  type ApiChallengeCriterion,
  type ApiChallengeSubmission,
  type ChallengeSubmissionStatus,
} from '../../../services/tracks'
import './ChallengeSubmissionPage.css'

type ScoreStyle = CSSProperties & {
  '--challenge-score'?: string
}

const supportedTechnologyIcons: Record<string, TechIconName> = {
  c: 'c',
  'c++': 'c-plus-plus',
  django: 'django',
  docker: 'docker',
  fastapi: 'fastapi',
  go: 'go',
  java: 'java',
  javascript: 'typescript',
  node: 'nodejs',
  nodejs: 'nodejs',
  php: 'php',
  postgresql: 'postgresql',
  python: 'python',
  react: 'react',
  ruby: 'ruby',
  rust: 'rust',
  typescript: 'typescript',
}

const submissionStatusMeta: Record<
  ChallengeSubmissionStatus,
  {
    badge: 'pending' | 'in-progress' | 'success' | 'danger'
    eyebrow: string
    label: string
    description: string
  }
> = {
  PENDING_AI: {
    badge: 'pending',
    eyebrow: 'Entrega recebida',
    label: 'Aguardando avaliação',
    description:
      'Sua entrega entrou na fila e será analisada assim que o avaliador estiver disponível.',
  },
  EVALUATING: {
    badge: 'in-progress',
    eyebrow: 'IA em execução',
    label: 'Analisando o repositório',
    description:
      'A estrutura, a implementação e cada critério do desafio estão sendo verificados.',
  },
  EVALUATED: {
    badge: 'success',
    eyebrow: 'Resultado disponível',
    label: 'Avaliação concluída',
    description:
      'Confira a nota, o feedback e a análise individual dos critérios abaixo.',
  },
  FAILED: {
    badge: 'danger',
    eyebrow: 'Avaliação interrompida',
    label: 'Não foi possível avaliar',
    description:
      'Revise o acesso ao repositório e tente enviar novamente em alguns instantes.',
  },
}

function formatDuration(minutes?: number | null) {
  if (!minutes) {
    return 'Não informada'
  }

  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes ? `${hours}h ${remainingMinutes}min` : `${hours}h`
}

function formatDate(value?: string | null) {
  if (!value) {
    return null
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function formatCriterionLabel(value: string) {
  const label = value.replace(/[_-]+/g, ' ').trim()
  return label ? `${label.charAt(0).toUpperCase()}${label.slice(1)}` : value
}

function getCriterionLabel(criterion: ApiChallengeCriterion, index: number) {
  const label = criterion.label || criterion.name
  return label?.trim() || `Critério ${index + 1}`
}

function criterionWasMet(criterion: ApiChallengeCriterion) {
  return criterion.present ?? criterion.passed ?? false
}

function getScore(submission?: ApiChallengeSubmission | null) {
  if (submission?.ai_score === null || submission?.ai_score === undefined) {
    return null
  }

  const score = Number(submission.ai_score)
  return Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : null
}

function validateGithubRepository(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return 'Informe a URL do repositório.'
  }

  try {
    const url = new URL(trimmedValue)
    const hostname = url.hostname.replace(/^www\./, '').toLowerCase()
    const pathParts = url.pathname.split('/').filter(Boolean)

    if (!['http:', 'https:'].includes(url.protocol)) {
      return 'Use uma URL iniciada por https://.'
    }

    if (hostname !== 'github.com') {
      return 'A entrega deve apontar para um repositório do GitHub.'
    }

    if (pathParts.length < 2) {
      return 'Informe a URL completa, incluindo o usuário e o repositório.'
    }

    return null
  } catch {
    return 'Informe uma URL válida do GitHub.'
  }
}

function normalizeGithubRepository(value: string) {
  const url = new URL(value.trim())
  url.hash = ''
  url.search = ''
  url.pathname = url.pathname.replace(/\/+$/, '')
  return url.toString().replace(/\/$/, '')
}

function getTechnologyMeta(language?: string | null) {
  const normalizedLanguage = language?.trim().toLowerCase() ?? ''
  const iconName = supportedTechnologyIcons[normalizedLanguage]

  return {
    category:
      normalizedLanguage === 'docker' || normalizedLanguage === 'postgresql'
        ? ('infra' as const)
        : normalizedLanguage === 'django' || normalizedLanguage === 'fastapi'
          ? ('framework' as const)
          : ('language' as const),
    iconName,
  }
}

function SubmissionIcon({ status }: { status: ChallengeSubmissionStatus }) {
  if (status === 'EVALUATED') {
    return <CheckCircle2 aria-hidden="true" size={23} />
  }

  if (status === 'FAILED') {
    return <XCircle aria-hidden="true" size={23} />
  }

  return <LoaderCircle aria-hidden="true" className="is-spinning" size={23} />
}

export default function ChallengeSubmissionPage() {
  const { trackId, moduleId, contentId } = useParams()
  const queryClient = useQueryClient()
  const [repositoryUrl, setRepositoryUrl] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [areEvaluatedCriteriaExpanded, setAreEvaluatedCriteriaExpanded] =
    useState(true)

  const resourceQuery = useQuery({
    queryKey: ['challenge-evaluation', trackId, moduleId, contentId, 'resource'],
    queryFn: async () => {
      if (!trackId || !moduleId || !contentId) {
        throw new Error('Endereço de desafio inválido.')
      }

      const [track, module, content, enrollment] = await Promise.all([
        getTrackApiById(trackId),
        getModuleById(moduleId),
        getContentById(contentId),
        getMyTrackEnrollment(trackId),
      ])

      if (
        String(module.track) !== trackId ||
        String(content.module) !== moduleId ||
        content.content_type !== 'CHALLENGE'
      ) {
        throw new Error('O conteúdo informado não corresponde a este desafio.')
      }

      return { track, module, content, enrollment }
    },
    enabled: Boolean(trackId && moduleId && contentId),
  })

  const submissionsQuery = useQuery({
    queryKey: ['challenge-evaluation', contentId, 'submissions'],
    queryFn: () => getChallengeSubmissions(contentId as string),
    enabled: Boolean(contentId && resourceQuery.data?.enrollment),
    refetchInterval: (query) => {
      const status = query.state.data?.[0]?.ai_status
      return status === 'PENDING_AI' || status === 'EVALUATING' ? 3500 : false
    },
  })

  const creatorId = resourceQuery.data?.track.creator_id
  const teacherQuery = useQuery({
    queryKey: ['users', creatorId],
    queryFn: () => getUserProfileById(creatorId as string),
    enabled: Boolean(creatorId),
  })

  const submissionMutation = useMutation({
    mutationFn: createChallengeSubmission,
    onSuccess: async () => {
      setRepositoryUrl('')
      setFormError(null)
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['challenge-evaluation', contentId, 'submissions'],
        }),
        queryClient.invalidateQueries({ queryKey: ['tracks'] }),
      ])
    },
  })

  const latestSubmission = submissionsQuery.data?.[0] ?? null
  const latestScore = getScore(latestSubmission)
  const isProcessing =
    latestSubmission?.ai_status === 'PENDING_AI' ||
    latestSubmission?.ai_status === 'EVALUATING'
  const isApproved =
    latestSubmission?.ai_status === 'EVALUATED' &&
    latestScore !== null &&
    latestScore >= 70
  const canSubmit = Boolean(resourceQuery.data?.enrollment) && !isProcessing

  const criteria = useMemo(
    () =>
      Object.entries(resourceQuery.data?.content.evaluation_criteria ?? {})
        .map(([label, weight]) => ({
          label: formatCriterionLabel(label),
          weight: Number(weight) || 0,
        }))
        .filter((criterion) => criterion.label),
    [resourceQuery.data?.content.evaluation_criteria],
  )

  const criteriaTotal = criteria.reduce(
    (total, criterion) => total + criterion.weight,
    0,
  )

  useEffect(() => {
    const title = resourceQuery.data?.content.title
    document.title = title
      ? `ATLAS · Avaliação de ${title}`
      : 'ATLAS · Avaliação do desafio'
  }, [resourceQuery.data?.content.title])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationError = validateGithubRepository(repositoryUrl)
    if (validationError) {
      setFormError(validationError)
      return
    }

    const enrollment = resourceQuery.data?.enrollment
    if (!enrollment || !contentId) {
      setFormError('Sua matrícula não foi encontrada para esta trilha.')
      return
    }

    setFormError(null)
    submissionMutation.mutate({
      user_track: enrollment.id,
      challenge: contentId,
      github_url: normalizeGithubRepository(repositoryUrl),
    })
  }

  if (resourceQuery.isLoading) {
    return (
      <main className="challenge-evaluation-page challenge-evaluation-page--state">
        <LoadingState
          message="Preparando a avaliação do desafio..."
          skeletonCount={4}
          variant="skeleton"
        />
      </main>
    )
  }

  if (resourceQuery.isError || !resourceQuery.data) {
    return (
      <main className="challenge-evaluation-page challenge-evaluation-page--state">
        <ErrorState
          message="Não foi possível abrir a avaliação deste desafio."
          onRetry={() => void resourceQuery.refetch()}
        />
        <ButtonLink to={`/trilhas/${trackId ?? ''}`} variant="outline">
          Voltar para a trilha
        </ButtonLink>
      </main>
    )
  }

  const { track, module, content, enrollment } = resourceQuery.data
  const teacherName = teacherQuery.data?.fullName || 'Professor responsável'
  const technologyMeta = getTechnologyMeta(content.language)
  const statusMeta = latestSubmission
    ? submissionStatusMeta[latestSubmission.ai_status]
    : null
  const evaluatedCriteria = latestSubmission?.ai_criteries ?? []
  const previousSubmissions = submissionsQuery.data?.slice(1) ?? []

  return (
    <main className="challenge-evaluation-page">
      <nav className="challenge-evaluation-breadcrumb" aria-label="Localização atual">
        <Link to={`/trilhas/${track.id}`}>{track.title}</Link>
        <ChevronRight aria-hidden="true" size={13} />
        <Link to={`/trilhas/${track.id}/modulos/${module.id}`}>
          {module.title}
        </Link>
        <ChevronRight aria-hidden="true" size={13} />
        <Link
          to={`/trilhas/${track.id}/modulos/${module.id}/conteudos/${content.id}`}
        >
          {content.title}
        </Link>
      </nav>

      <header className="challenge-evaluation-hero">
        <div className="challenge-evaluation-hero__copy">
          <span className="challenge-evaluation-hero__eyebrow">
            <Bot aria-hidden="true" size={16} />
            Desafio · avaliação por IA
          </span>
          <h1>{content.title}</h1>
          <p>
            Envie sua implementação, acompanhe a análise e transforme o feedback
            em uma próxima versão ainda melhor.
          </p>

          <div className="challenge-evaluation-hero__meta">
            {content.language ? (
              <TechTag
                category={technologyMeta.category}
                icon={
                  technologyMeta.iconName ? (
                    <TechIcon name={technologyMeta.iconName} />
                  ) : undefined
                }
                variant="solid"
              >
                {content.language}
              </TechTag>
            ) : null}
            <span>
              <Timer aria-hidden="true" size={15} />
              {formatDuration(content.duration_minutes)}
            </span>
            <span>
              <Layers3 aria-hidden="true" size={15} />
              {module.title}
            </span>
          </div>
        </div>

        <div className="challenge-evaluation-hero__signal" aria-hidden="true">
          <Sparkles size={30} />
          <span />
          <Bot size={34} />
        </div>
      </header>

      <section className="challenge-evaluation-layout">
        <div className="challenge-evaluation-brief">
          <InfoCard
            as="article"
            className="challenge-evaluation-enunciation"
            eyebrow="Enunciado"
            icon={<FileCheck2 size={19} />}
            iconTone="primary"
            title="O que você precisa desenvolver"
          >
            <div className="challenge-evaluation-enunciation__copy">
              {content.description?.trim() ? (
                <p className="challenge-evaluation-enunciation__summary">
                  {content.description}
                </p>
              ) : null}
              {content.instructions?.trim() ? (
                content.instructions
                  .split(/\n{2,}/)
                  .map((paragraph) => paragraph.trim())
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={`${paragraph}-${index}`}>{paragraph}</p>
                  ))
              ) : (
                <p>O enunciado deste desafio ainda não foi adicionado.</p>
              )}
            </div>
          </InfoCard>

          <article className="challenge-evaluation-criteria-card">
            <header>
              <span className="challenge-evaluation-section-icon">
                <Target aria-hidden="true" size={20} />
              </span>
              <div>
                <small>Rubrica do desafio</small>
                <h2>Como sua entrega será avaliada</h2>
              </div>
              {criteria.length > 0 ? (
                <StatusBadge size="sm" status="neutral">
                  {criteriaTotal} pontos
                </StatusBadge>
              ) : null}
            </header>

            {criteria.length > 0 ? (
              <ol className="challenge-evaluation-criteria-list">
                {criteria.map((criterion, index) => (
                  <li key={`${criterion.label}-${index}`}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{criterion.label}</strong>
                    <b>{criterion.weight} pts</b>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="challenge-evaluation-empty-copy">
                Os critérios específicos ainda não foram informados. Siga o
                enunciado e organize sua solução com clareza.
              </p>
            )}
          </article>
        </div>

        <aside className="challenge-submission-panel" aria-label="Sua submissão">
          <div className="challenge-submission-panel__topline">
            <div>
              <span className="challenge-evaluation-section-icon is-purple">
                <GitBranch aria-hidden="true" size={20} />
              </span>
              <div>
                <small>Sua entrega</small>
                <h2>
                  {latestSubmission ? 'Acompanhe sua submissão' : 'Pronto para enviar?'}
                </h2>
              </div>
            </div>
            {latestSubmission && statusMeta ? (
              <StatusBadge size="sm" status={statusMeta.badge}>
                {statusMeta.label}
              </StatusBadge>
            ) : null}
          </div>

          {latestSubmission && statusMeta ? (
            <div
              className={`challenge-submission-status is-${latestSubmission.ai_status.toLowerCase()}`}
              aria-live="polite"
            >
              <span className="challenge-submission-status__icon">
                <SubmissionIcon status={latestSubmission.ai_status} />
              </span>
              <div>
                <small>{statusMeta.eyebrow}</small>
                <strong>{statusMeta.label}</strong>
                <p>{statusMeta.description}</p>
              </div>
              {latestScore !== null && latestSubmission.ai_status === 'EVALUATED' ? (
                <b>{Math.round(latestScore)}<span>/100</span></b>
              ) : null}
            </div>
          ) : null}

          {latestSubmission ? (
            <a
              className="challenge-submission-repository"
              href={latestSubmission.github_url}
              rel="noreferrer"
              target="_blank"
            >
              <GitBranch aria-hidden="true" size={18} />
              <span>
                <small>Último repositório enviado</small>
                <strong>{latestSubmission.github_url.replace(/^https?:\/\//, '')}</strong>
              </span>
              <ExternalLink aria-hidden="true" size={16} />
            </a>
          ) : null}

          {!enrollment ? (
            <div className="challenge-submission-panel__notice is-warning">
              <CircleAlert aria-hidden="true" size={19} />
              <p>Você precisa estar matriculado nesta trilha para enviar uma entrega.</p>
            </div>
          ) : null}

          {canSubmit ? (
            <form className="challenge-submission-form" onSubmit={handleSubmit}>
              <label htmlFor="challenge-repository-url">
                {latestSubmission ? 'Enviar nova versão' : 'Repositório público do GitHub'}
              </label>
              <div
                className={`challenge-submission-form__field${
                  formError ? ' has-error' : ''
                }`}
              >
                <GitBranch aria-hidden="true" size={19} />
                <input
                  aria-describedby={formError ? 'challenge-repository-error' : undefined}
                  id="challenge-repository-url"
                  onChange={(event) => {
                    setRepositoryUrl(event.target.value)
                    if (formError) {
                      setFormError(null)
                    }
                  }}
                  placeholder="https://github.com/usuario/projeto"
                  type="url"
                  value={repositoryUrl}
                />
              </div>
              {formError ? (
                <span
                  className="challenge-submission-form__error"
                  id="challenge-repository-error"
                  role="alert"
                >
                  <CircleAlert aria-hidden="true" size={14} />
                  {formError}
                </span>
              ) : null}
              {submissionMutation.isError ? (
                <span className="challenge-submission-form__error" role="alert">
                  <CircleAlert aria-hidden="true" size={14} />
                  {getTrackRequestErrorMessage(
                    submissionMutation.error,
                    'Não foi possível enviar o repositório para avaliação.',
                  )}
                </span>
              ) : null}
              <Button
                iconRight={latestSubmission ? RotateCcw : Send}
                loading={submissionMutation.isPending}
                size="lg"
                type="submit"
              >
                {latestSubmission ? 'Enviar nova versão' : 'Enviar para avaliação'}
              </Button>
              <p className="challenge-submission-form__hint">
                <ShieldCheck aria-hidden="true" size={15} />
                O repositório precisa ser público durante a análise. A IA não altera
                nenhum arquivo do projeto.
              </p>
            </form>
          ) : null}

          {isProcessing ? (
            <div className="challenge-submission-panel__notice is-processing">
              <LoaderCircle aria-hidden="true" className="is-spinning" size={19} />
              <p>Nenhum novo envio é permitido enquanto esta análise estiver em andamento.</p>
            </div>
          ) : null}

          {isApproved ? (
            <div className="challenge-submission-panel__notice is-success">
              <CheckCircle2 aria-hidden="true" size={19} />
              <p>
                Desafio aprovado. A conclusão e o avanço da trilha são atualizados automaticamente.
              </p>
            </div>
          ) : null}

          <footer className="challenge-submission-panel__footer">
            <span>Professor responsável</span>
            <strong>{teacherName}</strong>
          </footer>
        </aside>
      </section>

      {submissionsQuery.isLoading ? (
        <section className="challenge-evaluation-result-loading">
          <LoaderCircle aria-hidden="true" className="is-spinning" size={20} />
          Carregando suas entregas...
        </section>
      ) : null}

      {submissionsQuery.isError ? (
        <section className="challenge-evaluation-result-error" role="alert">
          <CircleAlert aria-hidden="true" size={20} />
          <div>
            <strong>Não foi possível consultar as entregas</strong>
            <p>Tente atualizar os resultados em alguns instantes.</p>
          </div>
          <Button onClick={() => void submissionsQuery.refetch()} size="sm" variant="outline">
            Tentar novamente
          </Button>
        </section>
      ) : null}

      {latestSubmission?.ai_status === 'FAILED' ? (
        <section className="challenge-evaluation-failed" role="alert">
          <span><XCircle aria-hidden="true" size={25} /></span>
          <div>
            <small>A análise não foi concluída</small>
            <h2>Revise o repositório antes de reenviar</h2>
            <p>
              {latestSubmission.ai_feedback ||
                'Confirme se a URL está correta e se o repositório permanece público.'}
            </p>
          </div>
        </section>
      ) : null}

      {latestSubmission?.ai_status === 'EVALUATED' && latestScore !== null ? (
        <section className="challenge-evaluation-result" aria-labelledby="evaluation-result-title">
          <header className="challenge-evaluation-result__header">
            <div
              className={`challenge-evaluation-score${isApproved ? ' is-approved' : ' is-revision'}`}
              style={{ '--challenge-score': `${latestScore * 3.6}deg` } as ScoreStyle}
            >
              <div>
                <strong>{Math.round(latestScore)}</strong>
                <span>/100</span>
              </div>
            </div>
            <div>
              <span className="challenge-evaluation-result__eyebrow">
                <Sparkles aria-hidden="true" size={16} />
                Feedback da IA
              </span>
              <h2 id="evaluation-result-title">
                {isApproved ? 'Entrega aprovada' : 'Sua solução pode evoluir'}
              </h2>
              <p>
                {isApproved
                  ? 'Você atingiu a nota mínima e concluiu este desafio.'
                  : 'Use a análise abaixo para ajustar o projeto e enviar uma nova versão.'}
              </p>
            </div>
            <StatusBadge status={isApproved ? 'approved' : 'warning'}>
              {isApproved ? 'Aprovado' : 'Revisão recomendada'}
            </StatusBadge>
          </header>

          {latestSubmission.ai_feedback?.trim() ? (
            <article className="challenge-evaluation-feedback">
              <span className="challenge-evaluation-section-icon is-purple">
                <Bot aria-hidden="true" size={20} />
              </span>
              <div>
                <small>Análise geral</small>
                <h3>O que a IA observou no projeto</h3>
                <p>{latestSubmission.ai_feedback}</p>
                {formatDate(latestSubmission.evaluated_at) ? (
                  <time dateTime={latestSubmission.evaluated_at ?? undefined}>
                    Avaliado em {formatDate(latestSubmission.evaluated_at)}
                  </time>
                ) : null}
              </div>
            </article>
          ) : null}

          {evaluatedCriteria.length > 0 ? (
            <div
              className={`challenge-evaluated-criteria${
                areEvaluatedCriteriaExpanded ? ' is-expanded' : ''
              }`}
            >
              <button
                aria-controls="submission-evaluated-criteria-list"
                aria-expanded={areEvaluatedCriteriaExpanded}
                className="challenge-evaluated-criteria__toggle"
                onClick={() =>
                  setAreEvaluatedCriteriaExpanded((value) => !value)
                }
                type="button"
              >
                <div>
                  <Target aria-hidden="true" size={19} />
                  <h3>Critérios analisados</h3>
                </div>
                <span className="challenge-evaluated-criteria__summary">
                  <span>
                    {evaluatedCriteria.filter(criterionWasMet).length} de{' '}
                    {evaluatedCriteria.length} atendidos
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className="challenge-evaluated-criteria__chevron"
                    size={19}
                  />
                </span>
              </button>
              <div
                className="challenge-evaluated-criteria__list"
                hidden={!areEvaluatedCriteriaExpanded}
                id="submission-evaluated-criteria-list"
              >
                {evaluatedCriteria.map((criterion, index) => {
                  const wasMet = criterionWasMet(criterion)
                  return (
                    <article className={wasMet ? 'is-met' : 'is-missing'} key={criterion.id ?? index}>
                      <span className="challenge-evaluated-criteria__status">
                        {wasMet ? (
                          <Check aria-hidden="true" size={17} />
                        ) : (
                          <XCircle aria-hidden="true" size={17} />
                        )}
                      </span>
                      <div>
                        <div className="challenge-evaluated-criteria__title">
                          <strong>{getCriterionLabel(criterion, index)}</strong>
                          {criterion.kind ? (
                            <small>
                              {criterion.kind === 'profile'
                                ? 'Verificação do projeto'
                                : 'Critério do desafio'}
                            </small>
                          ) : null}
                        </div>
                        {criterion.evidence?.trim() ? <p>{criterion.evidence}</p> : null}
                      </div>
                      {criterion.weight !== undefined ? (
                        <b>{criterion.weight} pts</b>
                      ) : null}
                    </article>
                  )
                })}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {previousSubmissions.length > 0 ? (
        <section className="challenge-submission-history">
          <header>
            <History aria-hidden="true" size={20} />
            <div>
              <small>Histórico</small>
              <h2>Versões anteriores</h2>
            </div>
          </header>
          <ol>
            {previousSubmissions.map((submission) => {
              const meta = submissionStatusMeta[submission.ai_status]
              const score = getScore(submission)
              return (
                <li key={submission.id}>
                  <span className="challenge-submission-history__line" />
                  <div>
                    <strong>{meta.label}</strong>
                    <a href={submission.github_url} rel="noreferrer" target="_blank">
                      {submission.github_url.replace(/^https?:\/\//, '')}
                      <ExternalLink aria-hidden="true" size={13} />
                    </a>
                    <time dateTime={submission.submitted_at}>
                      {formatDate(submission.submitted_at)}
                    </time>
                  </div>
                  {score !== null ? <b>{Math.round(score)}/100</b> : null}
                </li>
              )
            })}
          </ol>
        </section>
      ) : null}

      <footer className="challenge-evaluation-footer">
        <ButtonLink
          className="challenge-evaluation-footer__back"
          size="md"
          to={`/trilhas/${track.id}/modulos/${module.id}/conteudos/${content.id}`}
          variant="outline"
        >
          <ArrowLeft aria-hidden="true" size={17} />
          Voltar ao desafio
        </ButtonLink>
        <p>
          <Clock3 aria-hidden="true" size={15} />
          As avaliações são processadas de forma assíncrona e podem levar alguns instantes.
        </p>
      </footer>
    </main>
  )
}
