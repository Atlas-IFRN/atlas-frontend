import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
} from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  ExternalLink,
  FileText,
  GitBranch,
  Layers3,
  LoaderCircle,
  MessageCircle,
  LockKeyhole,
  Play,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  XCircle,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import YouTube from 'react-youtube'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../../components/atoms/Button'
import { ButtonLink } from '../../../components/atoms/ButtonLink'
import { StatusBadge } from '../../../components/atoms/StatusBadge'
import { InfoCard } from '../../../components/molecules/InfoCard'
import { ErrorState, LoadingState } from '../../../components/states'
import { getUserProfileById } from '../../../services/auth'
import {
  completeContent,
  createChallengeSubmission,
  getChallengeSubmissions,
  getContentById,
  getModuleById,
  getMyTrackEnrollment,
  getTrackApiById,
  getTrackRequestErrorMessage,
  type ApiChallengeCriterion,
  type ApiChallengeSubmission,
  type ApiContent,
  type ChallengeSubmissionStatus,
  uncompleteContent,
} from '../../../services/tracks'
import type { TrailLessonType } from '../../../types/tracks'
import './ContentDetailsPage.css'

type LessonTab = 'about' | 'materials' | 'discussion'

const contentTypeMeta: Record<
  TrailLessonType,
  { label: string; Icon: LucideIcon; className: string }
> = {
  VIDEO: { label: 'Vídeo', Icon: Play, className: 'is-video' },
  ARTICLE: { label: 'Artigo', Icon: FileText, className: 'is-article' },
  CHALLENGE: { label: 'Desafio', Icon: Zap, className: 'is-challenge' },
}

function extractYouTubeId(value?: string | null) {
  if (!value) {
    return null
  }

  try {
    const url = new URL(value)
    const hostname = url.hostname.replace(/^www\./, '')

    if (hostname === 'youtu.be') {
      return url.pathname.split('/').filter(Boolean)[0] ?? null
    }

    if (
      hostname === 'youtube.com' ||
      hostname === 'm.youtube.com' ||
      hostname === 'youtube-nocookie.com'
    ) {
      if (url.pathname === '/watch') {
        return url.searchParams.get('v')
      }

      const parts = url.pathname.split('/').filter(Boolean)
      if (['embed', 'shorts', 'live'].includes(parts[0] ?? '')) {
        return parts[1] ?? null
      }
    }
  } catch {
    return /^[a-zA-Z0-9_-]{11}$/.test(value) ? value : null
  }

  return null
}

function formatDuration(minutes?: number | null) {
  if (!minutes) {
    return 'Duração não informada'
  }

  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes ? `${hours}h ${remainingMinutes}min` : `${hours}h`
}

function splitParagraphs(value?: string | null) {
  if (!value?.trim()) {
    return []
  }

  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

function formatCriterionLabel(value: string) {
  const label = value.replace(/[_-]+/g, ' ').trim()
  return label ? `${label.charAt(0).toUpperCase()}${label.slice(1)}` : value
}

type ScoreStyle = CSSProperties & {
  '--challenge-score'?: string
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

function SubmissionIcon({ status }: { status: ChallengeSubmissionStatus }) {
  if (status === 'EVALUATED') {
    return <CheckCircle2 aria-hidden="true" size={23} />
  }

  if (status === 'FAILED') {
    return <XCircle aria-hidden="true" size={23} />
  }

  return <LoaderCircle aria-hidden="true" className="is-spinning" size={23} />
}

function ContentViewer({
  content,
  onVideoEnd,
}: {
  content: ApiContent
  onVideoEnd?: () => void
}) {
  const [failedContentId, setFailedContentId] = useState<string | null>(null)
  const contentType = content.content_type ?? 'VIDEO'
  const youtubeId = extractYouTubeId(content.content_url)
  const playerError = failedContentId === content.id

  if (contentType === 'VIDEO') {
    if (!youtubeId || playerError) {
      return (
        <section className="lesson-viewer-unavailable">
          <CircleAlert aria-hidden="true" size={34} />
          <h2>Vídeo indisponível para reprodução</h2>
          <p>
            O endereço desta aula não corresponde a um vídeo incorporável do
            YouTube ou o autor desabilitou a reprodução externa.
          </p>
          {content.content_url ? (
            <a href={content.content_url} rel="noreferrer" target="_blank">
              Abrir conteúdo original
              <ExternalLink aria-hidden="true" size={15} />
            </a>
          ) : null}
        </section>
      )
    }

    return (
      <section className="lesson-youtube-frame" aria-label="Player da aula">
        <YouTube
          className="lesson-youtube-player"
          iframeClassName="lesson-youtube-iframe"
          loading="lazy"
          onError={() => setFailedContentId(content.id)}
          onEnd={onVideoEnd}
          opts={{
            width: '100%',
            height: '100%',
            playerVars: {
              autoplay: 0,
              controls: 1,
              playsinline: 1,
              rel: 0,
            },
          }}
          title={`Aula: ${content.title}`}
          videoId={youtubeId}
        />
      </section>
    )
  }

  if (contentType === 'ARTICLE') {
    const markdown = content.content?.trim() || content.description?.trim()

    return (
      <article className="native-article">
        <div className="native-article__label">
          <FileText aria-hidden="true" size={17} />
          Artigo
        </div>
        {markdown ? (
          <div className="native-article__content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              skipHtml
              components={{
                a: ({ children, ...props }) => (
                  <a {...props} rel="noopener noreferrer" target="_blank">
                    {children}
                  </a>
                ),
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="native-article__empty">
            O conteúdo deste artigo ainda não foi adicionado.
          </p>
        )}
      </article>
    )
  }

  const meta = contentTypeMeta[contentType]
  const Icon = meta.Icon
  const primaryText =
    contentType === 'CHALLENGE' ? content.instructions : content.description

  return (
    <section className={`lesson-resource-card ${meta.className}`}>
      <span className="lesson-resource-card__icon">
        <Icon aria-hidden="true" size={28} />
      </span>
      <div>
        <span className="lesson-resource-card__eyebrow">{meta.label}</span>
        <h2>{content.title}</h2>
        {splitParagraphs(primaryText).map((paragraph, index) => (
          <p key={`${paragraph}-${index}`}>{paragraph}</p>
        ))}
      </div>
      {content.content_url ? (
        <a href={content.content_url} rel="noreferrer" target="_blank">
          Acessar material original
          <ExternalLink aria-hidden="true" size={16} />
        </a>
      ) : null}
    </section>
  )
}

export default function ContentDetailsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { trackId, moduleId, contentId } = useParams()
  const [activeTab, setActiveTab] = useState<LessonTab>('about')
  const [repositoryUrl, setRepositoryUrl] = useState('')
  const [submissionFormError, setSubmissionFormError] = useState<string | null>(
    null,
  )
  const [areEvaluatedCriteriaExpanded, setAreEvaluatedCriteriaExpanded] =
    useState(true)

  const contentQuery = useQuery({
    queryKey: ['tracks', trackId, 'modules', moduleId, 'contents', contentId],
    queryFn: async () => {
      if (!trackId || !moduleId || !contentId) {
        throw new Error('Endereço de conteúdo inválido.')
      }

      const [track, module, content] = await Promise.all([
        getTrackApiById(trackId),
        getModuleById(moduleId),
        getContentById(contentId),
      ])

      if (
        String(module.track) !== trackId ||
        String(content.module) !== moduleId
      ) {
        throw new Error('O conteúdo não pertence à trilha informada.')
      }

      return { track, module, content }
    },
    enabled: Boolean(trackId && moduleId && contentId),
  })

  const creatorId = contentQuery.data?.track.creator_id
  const teacherQuery = useQuery({
    queryKey: ['users', creatorId],
    queryFn: () => getUserProfileById(creatorId as string),
    enabled: Boolean(creatorId),
  })

  const isChallengeContent =
    contentQuery.data?.content.content_type === 'CHALLENGE'

  const enrollmentQuery = useQuery({
    queryKey: ['tracks', trackId, 'enrollment'],
    queryFn: () => getMyTrackEnrollment(trackId as string),
    enabled: Boolean(trackId && isChallengeContent),
    retry: false,
  })

  const submissionsQuery = useQuery({
    queryKey: ['challenge-evaluation', contentId, 'submissions'],
    queryFn: () => getChallengeSubmissions(contentId as string),
    enabled: Boolean(contentId && isChallengeContent && enrollmentQuery.data),
    refetchInterval: (query) => {
      const status = query.state.data?.[0]?.ai_status
      return status === 'PENDING_AI' || status === 'EVALUATING' ? 3500 : false
    },
  })

  const completionMutation = useMutation({
    mutationFn: ({
      completed,
      contentId: targetContentId,
    }: {
      completed: boolean
      contentId: string
    }) =>
      completed
        ? uncompleteContent(targetContentId)
        : completeContent(targetContentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tracks'] })
      await contentQuery.refetch()
    },
  })

  const submissionMutation = useMutation({
    mutationFn: createChallengeSubmission,
    onSuccess: async () => {
      setRepositoryUrl('')
      setSubmissionFormError(null)
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['challenge-evaluation', contentId, 'submissions'],
        }),
        queryClient.invalidateQueries({ queryKey: ['tracks'] }),
        contentQuery.refetch(),
      ])
    },
  })

  const latestSubmission = submissionsQuery.data?.[0] ?? null
  const latestScore = getScore(latestSubmission)
  const isSubmissionProcessing =
    latestSubmission?.ai_status === 'PENDING_AI' ||
    latestSubmission?.ai_status === 'EVALUATING'

  const navigation = useMemo(() => {
    const track = contentQuery.data?.track
    const currentContentId = contentQuery.data?.content.id
    const completedModules = track?.user_progress?.completed_modules ?? 0
    const completedContentIds = new Set(
      track?.user_progress?.completed_content_ids ?? [],
    )
    const modules = [...(track?.modules ?? [])]
      .sort(
        (current, next) =>
          (current.display_order ?? 0) - (next.display_order ?? 0),
      )
      .map((module, moduleIndex) => {
        const contents = [...(module.contents ?? [])].sort(
          (current, next) =>
            (current.display_order ?? 0) - (next.display_order ?? 0),
        )
        const completed =
          contents.length > 0 &&
          contents.every((item) => completedContentIds.has(item.id))
        const locked =
          Boolean(track?.user_progress?.enrolled) &&
          moduleIndex > completedModules

        return {
          ...module,
          moduleIndex,
          completed,
          locked,
          contents,
        }
      })
    const orderedContents = modules.flatMap((module) =>
      module.contents.map((content) => ({ content, module })),
    )
    const allContents = orderedContents.map((item) => ({
      ...item,
      completed: completedContentIds.has(item.content.id),
      locked: item.module.locked,
    }))
    const currentIndex = allContents.findIndex(
      ({ content }) => content.id === currentContentId,
    )

    return {
      modules,
      contents: allContents,
      currentIndex,
      previous: currentIndex > 0 ? allContents[currentIndex - 1] : null,
      next:
        currentIndex >= 0 && currentIndex < allContents.length - 1
          ? allContents[currentIndex + 1]
          : null,
    }
  }, [contentQuery.data])

  const currentModuleIndex = navigation.modules.findIndex(
    (module) => module.id === moduleId,
  )
  const currentLessonIndex =
    navigation.modules[currentModuleIndex]?.contents.findIndex(
      (content) => content.id === contentId,
    ) ?? -1

  useEffect(() => {
    const title = contentQuery.data?.content.title
    document.title = title ? `ATLAS · ${title}` : 'ATLAS · Conteúdo da trilha'
  }, [contentQuery.data?.content.title])

  useEffect(() => {
    if (latestSubmission?.ai_status !== 'EVALUATED') {
      return
    }

    void Promise.all([
      queryClient.invalidateQueries({ queryKey: ['tracks'] }),
      contentQuery.refetch(),
    ])
  }, [latestSubmission?.id, latestSubmission?.ai_status, queryClient])

  if (contentQuery.isLoading) {
    return (
      <main className="lesson-viewer-page lesson-viewer-page--state">
        <LoadingState
          message="Carregando conteúdo da trilha..."
          skeletonCount={3}
          variant="skeleton"
        />
      </main>
    )
  }

  if (contentQuery.isError || !contentQuery.data) {
    return (
      <main className="lesson-viewer-page lesson-viewer-page--state">
        <ErrorState
          message="Não foi possível abrir este conteúdo. Confirme sua matrícula e tente novamente."
          onRetry={() => void contentQuery.refetch()}
        />
        <ButtonLink to={`/trilhas/${trackId ?? ''}`} variant="outline">
          Voltar para a trilha
        </ButtonLink>
      </main>
    )
  }

  const { track, module, content } = contentQuery.data
  const teacherName = teacherQuery.data?.fullName || 'Professor responsável'
  const department =
    teacherQuery.data?.courseName?.replace(/\s+-\s+Campus.*$/i, '').trim() ||
    'Departamento não informado'
  const progress = Math.max(
    0,
    Math.min(100, Number(track.user_progress?.percentage ?? 0)),
  )
  const isChallenge = content.content_type === 'CHALLENGE'
  const isNativeArticle = content.content_type === 'ARTICLE'
  const isContentCompleted = Boolean(
    track.user_progress?.completed_content_ids?.includes(content.id),
  )
  const evaluationCriteria = Object.entries(content.evaluation_criteria ?? {})
    .map(([label, score]) => ({
      label: formatCriterionLabel(label),
      score: Number(score) || 0,
    }))
    .filter((criterion) => criterion.label)
  const evaluationTotal = evaluationCriteria.reduce(
    (total, criterion) => total + criterion.score,
    0,
  )
  const challengeTabs = [
    ['about', 'Sobre a aula', BookOpen],
    ['materials', 'Materiais', FileText],
    ['discussion', 'Discussão', MessageCircle],
  ] as const
  const statusMeta = latestSubmission
    ? submissionStatusMeta[latestSubmission.ai_status]
    : null
  const evaluatedCriteria = latestSubmission?.ai_criteries ?? []
  const isApproved =
    latestSubmission?.ai_status === 'EVALUATED' &&
    latestScore !== null &&
    latestScore >= 70
  const canSubmitChallenge =
    Boolean(enrollmentQuery.data) &&
    !isSubmissionProcessing &&
    !submissionsQuery.isLoading &&
    !submissionsQuery.isError

  function goToLesson(target: typeof navigation.next) {
    if (!target || target.locked) {
      return
    }

    navigate(
      `/trilhas/${track.id}/modulos/${target.module.id}/conteudos/${target.content.id}`,
    )
  }

  function handleCompleteContent() {
    if (isChallenge || completionMutation.isPending) {
      return
    }

    completionMutation.mutate({
      completed: isContentCompleted,
      contentId: content.id,
    })
  }

  function handleVideoEnd() {
    handleCompleteContent()
  }

  function handleChallengeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationError = validateGithubRepository(repositoryUrl)
    if (validationError) {
      setSubmissionFormError(validationError)
      return
    }

    const enrollment = enrollmentQuery.data
    if (!enrollment || !contentId) {
      setSubmissionFormError(
        'Sua matrícula não foi encontrada para esta trilha.',
      )
      return
    }

    setSubmissionFormError(null)
    submissionMutation.mutate({
      user_track: enrollment.id,
      challenge: contentId,
      github_url: normalizeGithubRepository(repositoryUrl),
    })
  }

  return (
    <main
      className={`lesson-viewer-page${isChallenge ? ' lesson-viewer-page--challenge' : ''}`}
    >
      <section className="lesson-viewer-main">
        {isChallenge ? (
          <>
            <header className="lesson-viewer-header challenge-viewer-header">
              <nav
                className="lesson-viewer-breadcrumb"
                aria-label="Localização do conteúdo"
              >
                <Link to={`/trilhas/${track.id}`}>{track.title}</Link>
                <ChevronRight aria-hidden="true" size={13} />
                <Link to={`/trilhas/${track.id}/modulos/${module.id}`}>
                  {module.title}
                </Link>
              </nav>
              <h1>{content.title}</h1>
              <p>
                Prof. {teacherName} <span aria-hidden="true">•</span>{' '}
                {department}
              </p>
            </header>

            <section className="challenge-hero" aria-label="Resumo do desafio">
              <span className="lesson-viewer-position">
                Módulo {currentModuleIndex + 1} · Aula {currentLessonIndex + 1}{' '}
                de{' '}
                {module.contents?.length ??
                  navigation.modules[currentModuleIndex]?.contents.length ??
                  0}
              </span>

              <div className="challenge-hero__copy">
                <div className="challenge-hero__topline">
                  <div className="challenge-hero__eyebrow">
                    <span className="challenge-hero__badge">
                      <Sparkles aria-hidden="true" size={15} />
                      Desafio prático
                    </span>
                    <span className="challenge-hero__type">
                      Conteúdo da trilha
                    </span>
                  </div>

                  <span
                    className={`challenge-completion-status${
                      isContentCompleted ? ' is-completed' : ''
                    }`}
                  >
                    <CheckCircle2 aria-hidden="true" size={15} />
                    {isContentCompleted
                      ? 'Desafio concluído'
                      : 'Conclui após aprovação'}
                  </span>
                </div>

                <p className="challenge-hero__summary">
                  {content.description ||
                    'Resolva o desafio seguindo o enunciado, os critérios de avaliação e as orientações do professor.'}
                </p>

                <dl className="challenge-hero__details">
                  <div>
                    <Clock3 aria-hidden="true" size={17} />
                    <dt>Duração estimada</dt>
                    <dd>{formatDuration(content.duration_minutes)}</dd>
                  </div>
                  {content.language ? (
                    <div>
                      <Zap aria-hidden="true" size={17} />
                      <dt>Tecnologia</dt>
                      <dd>{content.language}</dd>
                    </div>
                  ) : null}
                  <div>
                    <Layers3 aria-hidden="true" size={17} />
                    <dt>Módulo atual</dt>
                    <dd>{module.title}</dd>
                  </div>
                  <div>
                    <BookOpen aria-hidden="true" size={17} />
                    <dt>Posição</dt>
                    <dd>
                      Aula {currentLessonIndex + 1} de{' '}
                      {module.contents?.length ??
                        navigation.modules[currentModuleIndex]?.contents
                          .length ??
                        0}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            <section className="challenge-workspace">
              <div
                className="challenge-tabs"
                role="tablist"
                aria-label="Informações do desafio"
              >
                {challengeTabs.map(([value, label, Icon]) => (
                  <button
                    aria-selected={activeTab === value}
                    className={activeTab === value ? 'is-active' : ''}
                    key={value}
                    onClick={() => setActiveTab(value)}
                    role="tab"
                    type="button"
                  >
                    <Icon aria-hidden="true" size={17} />
                    {label}
                  </button>
                ))}
              </div>

              <div className="challenge-tab-panel" role="tabpanel">
                {activeTab === 'about' ? (
                  <div className="challenge-about-panel">
                    <section className="challenge-integrated-layout">
                      <div className="challenge-brief-main">
                        <InfoCard
                          as="article"
                          className="challenge-card--enunciation"
                          eyebrow="Atividade"
                          icon={<BookOpen size={18} />}
                          iconTone="primary"
                          title="Enunciado do desafio"
                        >
                          <div className="challenge-enunciation">
                            {content.instructions?.trim() ? (
                              splitParagraphs(content.instructions).map(
                                (paragraph, index) => (
                                  <p key={`${paragraph}-${index}`}>
                                    {paragraph}
                                  </p>
                                ),
                              )
                            ) : (
                              <p>
                                O enunciado deste desafio ainda não foi
                                adicionado.
                              </p>
                            )}
                          </div>
                        </InfoCard>

                        <article className="challenge-card challenge-card--evaluation">
                          <header className="challenge-card__header">
                            <span className="challenge-card__icon">
                              <Target aria-hidden="true" size={18} />
                            </span>
                            <div>
                              <small>Rubrica do desafio</small>
                              <h2>Como sua entrega será avaliada</h2>
                            </div>
                            {evaluationCriteria.length > 0 ? (
                              <StatusBadge size="sm" status="neutral">
                                {evaluationTotal} pontos
                              </StatusBadge>
                            ) : null}
                          </header>

                          {evaluationCriteria.length > 0 ? (
                            <ol className="challenge-criteria-list">
                              {evaluationCriteria.map((criterion, index) => (
                                <li key={`${criterion.label}-${index}`}>
                                  <span>
                                    {String(index + 1).padStart(2, '0')}
                                  </span>
                                  <strong>{criterion.label}</strong>
                                  <b>Peso: {criterion.score} </b>
                                </li>
                              ))}
                            </ol>
                          ) : (
                            <p className="challenge-card__empty">
                              Siga todos os requisitos e entregue uma solução
                              organizada, clara e bem documentada.
                            </p>
                          )}
                        </article>

                      <section
                        className="challenge-submission-panel"
                        aria-label="Sua submissão"
                      >
                        <div className="challenge-submission-panel__topline">
                          <div>
                            <span className="challenge-evaluation-section-icon is-purple">
                              <GitBranch aria-hidden="true" size={20} />
                            </span>
                            <div>
                              <small>Sua entrega</small>
                              <h2>
                                {latestSubmission
                                  ? 'Acompanhe sua submissão'
                                  : 'Envie seu projeto para avaliação'}
                              </h2>
                              <p className="challenge-submission-panel__description">
                                Envie um repositório público do GitHub e acompanhe
                                o processamento, a nota e o feedback da IA sem
                                sair desta aula.
                              </p>
                            </div>
                          </div>
                          {latestSubmission && statusMeta ? (
                            <StatusBadge size="sm" status={statusMeta.badge}>
                              {statusMeta.label}
                            </StatusBadge>
                          ) : null}
                        </div>

                        <div className="challenge-submission-panel__body">
                          <div className="challenge-submission-panel__summary">
                            {submissionsQuery.isLoading ? (
                              <div className="challenge-evaluation-result-loading">
                                <LoaderCircle
                                  aria-hidden="true"
                                  className="is-spinning"
                                  size={19}
                                />
                                Consultando suas entregas...
                              </div>
                            ) : null}

                            {submissionsQuery.isError ? (
                              <div
                                className="challenge-evaluation-result-error"
                                role="alert"
                              >
                                <CircleAlert aria-hidden="true" size={19} />
                                <div>
                                  <strong>
                                    Não foi possível consultar as entregas
                                  </strong>
                                  <p>Tente novamente em alguns instantes.</p>
                                </div>
                                <Button
                                  onClick={() =>
                                    void submissionsQuery.refetch()
                                  }
                                  size="sm"
                                  variant="outline"
                                >
                                  Tentar novamente
                                </Button>
                              </div>
                            ) : null}

                            {latestSubmission && statusMeta ? (
                              <div
                                className={`challenge-submission-status is-${latestSubmission.ai_status.toLowerCase()}`}
                                aria-live="polite"
                              >
                                <span className="challenge-submission-status__icon">
                                  <SubmissionIcon
                                    status={latestSubmission.ai_status}
                                  />
                                </span>
                                <div>
                                  <small>{statusMeta.eyebrow}</small>
                                  <strong>{statusMeta.label}</strong>
                                  <p>{statusMeta.description}</p>
                                </div>
                                {latestScore !== null &&
                                latestSubmission.ai_status === 'EVALUATED' ? (
                                  <b>
                                    {Math.round(latestScore)}
                                    <span>/100</span>
                                  </b>
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
                                  <strong>
                                    {latestSubmission.github_url.replace(
                                      /^https?:\/\//,
                                      '',
                                    )}
                                  </strong>
                                </span>
                                <ExternalLink aria-hidden="true" size={16} />
                              </a>
                            ) : null}

                            {enrollmentQuery.isError ||
                            !enrollmentQuery.data ? (
                              <div className="challenge-submission-panel__notice is-warning">
                                <CircleAlert aria-hidden="true" size={19} />
                                <p>
                                  Você precisa estar matriculado nesta trilha
                                  para enviar uma entrega.
                                </p>
                              </div>
                            ) : null}

                            {isSubmissionProcessing ? (
                              <div className="challenge-submission-panel__notice is-processing">
                                <LoaderCircle
                                  aria-hidden="true"
                                  className="is-spinning"
                                  size={19}
                                />
                                <p>
                                  Nenhum novo envio é permitido enquanto esta
                                  análise estiver em andamento.
                                </p>
                              </div>
                            ) : null}

                            {isApproved ? (
                              <div className="challenge-submission-panel__notice is-success">
                                <CheckCircle2 aria-hidden="true" size={19} />
                                <p>
                                  Desafio aprovado. A conclusão e o avanço da
                                  trilha são atualizados automaticamente.
                                </p>
                              </div>
                            ) : null}
                          </div>

                          <div className="challenge-submission-panel__action">
                            {canSubmitChallenge ? (
                              <form
                                className="challenge-submission-form"
                                onSubmit={handleChallengeSubmit}
                              >
                                <label htmlFor="challenge-repository-url">
                                  {latestSubmission
                                    ? 'Enviar uma nova versão'
                                    : 'Repositório público do GitHub'}
                                </label>
                                <div
                                  className={`challenge-submission-form__field${
                                    submissionFormError ? ' has-error' : ''
                                  }`}
                                >
                                  <GitBranch aria-hidden="true" size={19} />
                                  <input
                                    aria-describedby={
                                      submissionFormError
                                        ? 'challenge-repository-error'
                                        : undefined
                                    }
                                    id="challenge-repository-url"
                                    onChange={(event) => {
                                      setRepositoryUrl(event.target.value)
                                      if (submissionFormError) {
                                        setSubmissionFormError(null)
                                      }
                                    }}
                                    placeholder="https://github.com/usuario/projeto"
                                    type="url"
                                    value={repositoryUrl}
                                  />
                                </div>

                                {submissionFormError ? (
                                  <span
                                    className="challenge-submission-form__error"
                                    id="challenge-repository-error"
                                    role="alert"
                                  >
                                    <CircleAlert
                                      aria-hidden="true"
                                      size={14}
                                    />
                                    {submissionFormError}
                                  </span>
                                ) : null}

                                {submissionMutation.isError ? (
                                  <span
                                    className="challenge-submission-form__error"
                                    role="alert"
                                  >
                                    <CircleAlert
                                      aria-hidden="true"
                                      size={14}
                                    />
                                    {getTrackRequestErrorMessage(
                                      submissionMutation.error,
                                      'Não foi possível enviar o repositório para avaliação.',
                                    )}
                                  </span>
                                ) : null}

                                <Button
                                  iconRight={
                                    latestSubmission ? RotateCcw : Send
                                  }
                                  loading={submissionMutation.isPending}
                                  size="lg"
                                  type="submit"
                                >
                                  {latestSubmission
                                    ? 'Enviar nova versão'
                                    : 'Enviar para avaliação'}
                                </Button>

                                <p className="challenge-submission-form__hint">
                                  <ShieldCheck
                                    aria-hidden="true"
                                    size={15}
                                  />
                                  O repositório precisa ser público durante a
                                  análise. A IA apenas lê o projeto e não altera
                                  nenhum arquivo.
                                </p>
                              </form>
                            ) : (
                              <div className="challenge-submission-action-locked">
                                <ShieldCheck aria-hidden="true" size={22} />
                                <div>
                                  <strong>
                                    {isSubmissionProcessing
                                      ? 'Avaliação em andamento'
                                      : 'Envio indisponível'}
                                  </strong>
                                  <p>
                                    {isSubmissionProcessing
                                      ? 'O campo para uma nova versão será liberado assim que a análise atual terminar.'
                                      : 'Confirme sua matrícula para liberar o envio do repositório.'}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </section>
                      </div>
                    </section>

                    {latestSubmission?.ai_status === 'FAILED' ? (
                      <section
                        className="challenge-evaluation-failed"
                        role="alert"
                      >
                        <span>
                          <XCircle aria-hidden="true" size={25} />
                        </span>
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

                    {latestSubmission?.ai_status === 'EVALUATED' &&
                    latestScore !== null ? (
                      <section
                        className="challenge-evaluation-result"
                        aria-labelledby="evaluation-result-title"
                      >
                        <header className="challenge-evaluation-result__header">
                          <div
                            className={`challenge-evaluation-score${
                              isApproved ? ' is-approved' : ' is-revision'
                            }`}
                            style={
                              {
                                '--challenge-score': `${latestScore * 3.6}deg`,
                              } as ScoreStyle
                            }
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
                              {isApproved
                                ? 'Entrega aprovada'
                                : 'Sua solução pode evoluir'}
                            </h2>
                            <p>
                              {isApproved
                                ? 'Você atingiu a nota mínima e concluiu este desafio.'
                                : 'Use a análise abaixo para ajustar o projeto e enviar uma nova versão.'}
                            </p>
                          </div>
                          <StatusBadge
                            status={isApproved ? 'approved' : 'warning'}
                          >
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
                                <time
                                  dateTime={
                                    latestSubmission.evaluated_at ?? undefined
                                  }
                                >
                                  Avaliado em{' '}
                                  {formatDate(latestSubmission.evaluated_at)}
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
                              aria-controls="content-evaluated-criteria-list"
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
                                  {
                                    evaluatedCriteria.filter(criterionWasMet)
                                      .length
                                  }{' '}
                                  de {evaluatedCriteria.length} atendidos
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
                              id="content-evaluated-criteria-list"
                            >
                              {evaluatedCriteria.map((criterion, index) => {
                                const wasMet = criterionWasMet(criterion)

                                return (
                                  <article
                                    className={wasMet ? 'is-met' : 'is-missing'}
                                    key={criterion.id ?? index}
                                  >
                                    <span className="challenge-evaluated-criteria__status">
                                      {wasMet ? (
                                        <Check aria-hidden="true" size={17} />
                                      ) : (
                                        <XCircle aria-hidden="true" size={17} />
                                      )}
                                    </span>
                                    <div>
                                      <div className="challenge-evaluated-criteria__title">
                                        <strong>
                                          {getCriterionLabel(criterion, index)}
                                        </strong>
                                        {criterion.kind ? (
                                          <small>
                                            {criterion.kind === 'profile'
                                              ? 'Verificação do projeto'
                                              : 'Critério do desafio'}
                                          </small>
                                        ) : null}
                                      </div>
                                      {criterion.evidence?.trim() ? (
                                        <p>{criterion.evidence}</p>
                                      ) : null}
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
                  </div>
                ) : null}

                {activeTab === 'materials' ? (
                  <div className="lesson-information__empty">
                    <FileText aria-hidden="true" size={24} />
                    <div>
                      <strong>
                        {content.content_url
                          ? 'Recurso disponibilizado pelo professor'
                          : 'Materiais complementares em breve'}
                      </strong>
                      <p>
                        {content.content_url
                          ? 'Use este material como referência para desenvolver sua solução.'
                          : 'O upload e a listagem de anexos serão conectados em uma próxima etapa.'}
                      </p>
                      {content.content_url ? (
                        <a
                          className="lesson-information__empty-link"
                          href={content.content_url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Acessar material
                          <ExternalLink aria-hidden="true" size={15} />
                        </a>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {activeTab === 'discussion' ? (
                  <div className="lesson-information__empty">
                    <CircleAlert aria-hidden="true" size={24} />
                    <div>
                      <strong>Discussão ainda não disponível</strong>
                      <p>
                        O espaço de conversa desta aula será conectado em uma
                        próxima etapa.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            <footer className="challenge-navigation">
              <Button
                className="challenge-navigation__button"
                iconLeft={ChevronLeft}
                size="md"
                variant="outline"
                disabled={!navigation.previous || navigation.previous.locked}
                onClick={() => goToLesson(navigation.previous)}
              >
                <span>
                  <small>Voltar</small>
                  Aula anterior
                </span>
              </Button>
              <Button
                className="challenge-navigation__button"
                iconRight={ChevronRight}
                size="md"
                variant="outline"
                disabled={!navigation.next || navigation.next.locked}
                onClick={() => goToLesson(navigation.next)}
              >
                <span>
                  <small>Continuar</small>
                  Próxima aula
                </span>
              </Button>
            </footer>
          </>
        ) : (
          <>
            <header className="lesson-viewer-header">
              <nav
                className="lesson-viewer-breadcrumb"
                aria-label="Localização do conteúdo"
              >
                <Link to={`/trilhas/${track.id}`}>{track.title}</Link>
                <ChevronRight aria-hidden="true" size={13} />
                <Link to={`/trilhas/${track.id}/modulos/${module.id}`}>
                  {module.title}
                </Link>
              </nav>
              <h1>{content.title}</h1>
              <p>
                Prof. {teacherName} <span aria-hidden="true">•</span>{' '}
                {department}
              </p>
            </header>

            <div
              className={`lesson-viewer-stage${
                isNativeArticle ? ' lesson-viewer-stage--external' : ''
              }`}
            >
              <span className="lesson-viewer-position">
                Módulo {currentModuleIndex + 1} · Aula {currentLessonIndex + 1}{' '}
                de{' '}
                {module.contents?.length ??
                  navigation.modules[currentModuleIndex]?.contents.length ??
                  0}
              </span>
              <ContentViewer content={content} onVideoEnd={handleVideoEnd} />
            </div>

            <section
              className={`lesson-information${
                isNativeArticle ? ' lesson-information--external' : ''
              }`}
            >
              <div className="lesson-information__toolbar">
                <div
                  className="lesson-information__tabs"
                  role="tablist"
                  aria-label="Informações da aula"
                >
                  {(
                    [
                      ['about', isNativeArticle ? 'Detalhes' : 'Sobre a aula'],
                      ['materials', 'Materiais'],
                      ['discussion', 'Discussão'],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      aria-selected={activeTab === value}
                      className={activeTab === value ? 'is-active' : ''}
                      key={value}
                      onClick={() => setActiveTab(value)}
                      role="tab"
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="lesson-completion-action" aria-live="polite">
                  <Button
                    className={isContentCompleted ? 'is-completed' : ''}
                    iconLeft={CheckCircle2}
                    loading={completionMutation.isPending}
                    size="md"
                    variant="outline"
                    title={
                      isContentCompleted
                        ? 'Clique para desmarcar a conclusão desta aula.'
                        : undefined
                    }
                    disabled={completionMutation.isPending}
                    onClick={handleCompleteContent}
                  >
                    {isContentCompleted
                      ? content.content_type === 'VIDEO'
                        ? 'Aula assistida'
                        : 'Aula concluída'
                      : content.content_type === 'VIDEO'
                        ? 'Marcar como assistida'
                        : 'Marcar como concluído'}
                  </Button>
                  {completionMutation.isError ? (
                    <span role="alert">
                      {getTrackRequestErrorMessage(
                        completionMutation.error,
                        'Não foi possível concluir esta aula.',
                      )}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="lesson-information__body" role="tabpanel">
                {activeTab === 'about' ? (
                  <>
                    <div className="lesson-information__meta">
                      <span>
                        <Clock3 aria-hidden="true" size={16} />
                        {formatDuration(content.duration_minutes)}
                      </span>
                      <span>
                        {contentTypeMeta[content.content_type ?? 'VIDEO'].label}
                      </span>
                    </div>
                    {isNativeArticle ? null : splitParagraphs(
                        content.description,
                      ).length > 0 ? (
                      splitParagraphs(content.description).map(
                        (paragraph, index) => (
                          <p key={`${paragraph}-${index}`}>{paragraph}</p>
                        ),
                      )
                    ) : (
                      <p>Esta aula ainda não possui uma descrição detalhada.</p>
                    )}
                  </>
                ) : null}

                {activeTab === 'materials' ? (
                  <div className="lesson-information__empty">
                    {/* TODO(backend): substituir este estado mockado pela listagem real de anexos. */}
                    <FileText aria-hidden="true" size={24} />
                    <div>
                      <strong>Materiais complementares em breve</strong>
                      <p>
                        O upload e a listagem de anexos serão conectados em uma
                        próxima etapa.
                      </p>
                    </div>
                  </div>
                ) : null}

                {activeTab === 'discussion' ? (
                  <div className="lesson-information__empty">
                    <CircleAlert aria-hidden="true" size={24} />
                    <div>
                      <strong>Discussão ainda não disponível</strong>
                      <p>
                        O espaço de conversa desta aula será conectado em uma
                        próxima etapa.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              <footer className="lesson-navigation-footer">
                <button
                  disabled={!navigation.previous || navigation.previous.locked}
                  onClick={() => goToLesson(navigation.previous)}
                  type="button"
                >
                  <ChevronLeft aria-hidden="true" size={17} />
                  Aula anterior
                </button>
                <button
                  disabled={!navigation.next || navigation.next.locked}
                  onClick={() => goToLesson(navigation.next)}
                  type="button"
                >
                  Próxima aula
                  <ChevronRight aria-hidden="true" size={17} />
                </button>
              </footer>
            </section>
          </>
        )}
      </section>

      <aside className="lesson-sidebar" aria-label="Conteúdos da trilha">
        <header className="lesson-sidebar__header">
          <div>
            <span>Progresso da trilha</span>
            <strong>{Math.round(progress)}%</strong>
          </div>
          <div
            className="lesson-sidebar__progress"
            aria-label={`${Math.round(progress)}% concluído`}
          >
            <span style={{ inlineSize: `${progress}%` }} />
          </div>
        </header>

        <div className="lesson-sidebar__modules">
          {navigation.modules.map((sidebarModule) => (
            <section className="lesson-sidebar-module" key={sidebarModule.id}>
              <header>
                <span>
                  Módulo {sidebarModule.moduleIndex + 1} · {sidebarModule.title}
                </span>
                <small>
                  {sidebarModule.completed ? (
                    <Check aria-label="Módulo concluído" size={14} />
                  ) : (
                    `${sidebarModule.contents.length} aulas`
                  )}
                </small>
              </header>

              <div className="lesson-sidebar-module__contents">
                {sidebarModule.contents.map((sidebarContent) => {
                  const isCurrent = sidebarContent.id === content.id
                  const target = navigation.contents.find(
                    ({ content: currentContent }) =>
                      currentContent.id === sidebarContent.id,
                  )
                  const isCompleted = Boolean(target?.completed)
                  const isLocked = !isCurrent && Boolean(target?.locked)
                  const meta =
                    contentTypeMeta[sidebarContent.content_type ?? 'VIDEO']
                  const Icon = isLocked
                    ? LockKeyhole
                    : isCompleted
                      ? Check
                      : meta.Icon

                  return (
                    <button
                      className={[
                        'lesson-sidebar-item',
                        isCurrent ? 'is-current' : '',
                        isCompleted ? 'is-completed' : '',
                        isLocked ? 'is-locked' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      disabled={isLocked}
                      key={sidebarContent.id}
                      onClick={() =>
                        navigate(
                          `/trilhas/${track.id}/modulos/${sidebarModule.id}/conteudos/${sidebarContent.id}`,
                        )
                      }
                      type="button"
                    >
                      <span
                        className={`lesson-sidebar-item__icon ${meta.className}`}
                      >
                        <Icon aria-hidden="true" size={14} />
                      </span>
                      <span className="lesson-sidebar-item__copy">
                        <strong>{sidebarContent.title}</strong>
                        <small>
                          {formatDuration(sidebarContent.duration_minutes)}
                        </small>
                      </span>
                      <span className="lesson-sidebar-item__type">
                        {meta.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </aside>
    </main>
  )
}
