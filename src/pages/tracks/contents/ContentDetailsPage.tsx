import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  ExternalLink,
  FileText,
  Layers3,
  LockKeyhole,
  MessageCircle,
  Play,
  Sparkles,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import YouTube from 'react-youtube'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../../components/atoms/Button'
import { ButtonLink } from '../../../components/atoms/ButtonLink'
import { InfoCard } from '../../../components/molecules/InfoCard'
import { ErrorState, LoadingState } from '../../../components/states'
import { getUserProfileById } from '../../../services/auth'
import {
  getContentById,
  completeContent,
  getTrackRequestErrorMessage,
  getModuleById,
  getTrackApiById,
  type ApiContent,
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

      if (String(module.track) !== trackId || String(content.module) !== moduleId) {
        throw new Error('O conteúdo não pertence à trilha informada.')
      }

      return { track, module, content }
    },
    enabled: Boolean(trackId && moduleId && contentId),
    refetchInterval: (query) => {
      const data = query.state.data
      const isPendingChallenge =
        data?.content.content_type === 'CHALLENGE' &&
        !data.track.user_progress?.completed_content_ids?.includes(
          data.content.id,
        )

      return isPendingChallenge ? 5000 : false
    },
  })

  const creatorId = contentQuery.data?.track.creator_id
  const teacherQuery = useQuery({
    queryKey: ['users', creatorId],
    queryFn: () => getUserProfileById(creatorId as string),
    enabled: Boolean(creatorId),
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

  const navigation = useMemo(() => {
    const track = contentQuery.data?.track
    const currentContentId = contentQuery.data?.content.id
    const completedModules = track?.user_progress?.completed_modules ?? 0
    const completedContentIds = new Set(
      track?.user_progress?.completed_content_ids ?? [],
    )
    const modules = [...(track?.modules ?? [])]
      .sort((current, next) => (current.display_order ?? 0) - (next.display_order ?? 0))
      .map((module, moduleIndex) => ({
        ...module,
        moduleIndex,
        completed: moduleIndex < completedModules,
        locked: moduleIndex > completedModules,
        contents: [...(module.contents ?? [])].sort(
          (current, next) =>
            (current.display_order ?? 0) - (next.display_order ?? 0),
        ),
      }))
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
    teacherQuery.data?.courseName
      ?.replace(/\s+-\s+Campus.*$/i, '')
      .trim() || 'Departamento não informado'
  const progress = Math.max(0, Math.min(100, Number(track.user_progress?.percentage ?? 0)))
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

  return (
    <main
      className={`lesson-viewer-page${isChallenge ? ' lesson-viewer-page--challenge' : ''}`}
    >
      <section className="lesson-viewer-main">
        {isChallenge ? (
          <>
            <header className="lesson-viewer-header challenge-viewer-header">
              <nav className="lesson-viewer-breadcrumb" aria-label="Localização do conteúdo">
                <Link to={`/trilhas/${track.id}`}>{track.title}</Link>
                <ChevronRight aria-hidden="true" size={13} />
                <Link to={`/trilhas/${track.id}/modulos/${module.id}`}>
                  {module.title}
                </Link>
              </nav>
              <h1>{content.title}</h1>
              <p>
                Prof. {teacherName} <span aria-hidden="true">•</span> {department}
              </p>
            </header>

            <section className="challenge-hero" aria-label="Resumo do desafio">
              <span className="lesson-viewer-position">
                Módulo {currentModuleIndex + 1} · Aula {currentLessonIndex + 1} de{' '}
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
                    <span className="challenge-hero__type">Conteúdo da trilha</span>
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
                        navigation.modules[currentModuleIndex]?.contents.length ??
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
                  <div className="challenge-brief-grid">
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
                            <p>{content.instructions}</p>
                          ) : (
                            <p>O enunciado deste desafio ainda não foi adicionado.</p>
                          )}
                        </div>
                      </InfoCard>

                      <InfoCard
                        as="article"
                        className="challenge-card--requirements"
                        eyebrow="Implementação"
                        icon={<CheckCircle2 size={18} />}
                        iconTone="success"
                        title="Requisitos técnicos"
                      >
                        {content.technical_requirements?.length ? (
                          <ul className="challenge-checklist">
                            {content.technical_requirements.map((requirement) => (
                              <li key={requirement}>
                                <Check aria-hidden="true" size={16} />
                                <span>{requirement}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="challenge-card__empty">
                            Nenhum requisito técnico foi informado.
                          </p>
                        )}
                      </InfoCard>

                      <article className="challenge-card challenge-card--evaluation">
                        <header className="challenge-card__header">
                          <span className="challenge-card__icon challenge-card__icon--warning">
                            <ClipboardCheck aria-hidden="true" size={18} />
                          </span>
                          <div>
                            <small>Avaliação</small>
                            <h2>Critérios e peso</h2>
                          </div>
                          {evaluationCriteria.length > 0 ? (
                            <strong className="challenge-card__score">{evaluationTotal} pts</strong>
                          ) : null}
                        </header>
                        {evaluationCriteria.length > 0 ? (
                          <div className="challenge-criteria">
                            {evaluationCriteria.map((criterion) => {
                              const barValue = Math.min(
                                100,
                                evaluationTotal ? (criterion.score / evaluationTotal) * 100 : 0,
                              )

                              return (
                                <div className="challenge-criteria__item" key={criterion.label}>
                                  <div className="challenge-criteria__label">
                                    <span>{criterion.label}</span>
                                    <strong>{criterion.score}</strong>
                                  </div>
                                  <div className="challenge-criteria__bar" aria-hidden="true">
                                    <b style={{ inlineSize: `${barValue}%` }} />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <p className="challenge-card__empty">
                            Siga todos os requisitos e entregue uma solução organizada, clara e bem documentada.
                          </p>
                        )}
                      </article>

                    </div>

                    <aside
                      className="challenge-support-rail"
                      aria-label="Recursos complementares do desafio"
                    >
                      <button
                        className="challenge-support-card challenge-support-card--materials"
                        onClick={() => setActiveTab('materials')}
                        type="button"
                      >
                        <span className="challenge-support-card__icon">
                          <FileText aria-hidden="true" size={19} />
                        </span>
                        <span className="challenge-support-card__content">
                          <small>Material de apoio</small>
                          <strong>
                            {content.content_url
                              ? 'Material disponível'
                              : 'Sem material adicional'}
                          </strong>
                          <span>
                            {content.content_url
                              ? 'Consulte o recurso disponibilizado pelo professor.'
                              : 'Quando o professor adicionar arquivos ou referências, eles aparecerão aqui.'}
                          </span>
                        </span>
                        <span className="challenge-support-card__action">
                          Ver materiais
                          <ChevronRight aria-hidden="true" size={15} />
                        </span>
                      </button>

                      <button
                        className="challenge-support-card challenge-support-card--discussion"
                        onClick={() => setActiveTab('discussion')}
                        type="button"
                      >
                        <span className="challenge-support-card__icon">
                          <MessageCircle aria-hidden="true" size={19} />
                        </span>
                        <span className="challenge-support-card__content">
                          <small>Discussão</small>
                          <strong>Espaço para dúvidas e trocas</strong>
                          <span>
                            As conversas da turma continuarão aqui quando o recurso estiver disponível.
                          </span>
                        </span>
                        <span className="challenge-support-card__action">
                          Ver discussão
                          <ChevronRight aria-hidden="true" size={15} />
                        </span>
                      </button>
                    </aside>

                  </div>
                ) : null}

                {activeTab === 'materials' ? (
                  <div className="challenge-resource-state challenge-resource-state--materials">
                    <span>
                      <FileText aria-hidden="true" size={26} />
                    </span>
                    <div>
                      <small>Materiais de apoio</small>
                      <h2>
                        {content.content_url
                          ? 'Recurso disponibilizado pelo professor'
                          : 'Nenhum material complementar'}
                      </h2>
                      <p>
                        {content.content_url
                          ? 'Use este material como referência para desenvolver sua solução.'
                          : 'Quando o professor adicionar arquivos ou referências, eles aparecerão aqui.'}
                      </p>
                    </div>
                    {content.content_url ? (
                      <a href={content.content_url} rel="noreferrer" target="_blank">
                        Acessar material
                        <ExternalLink aria-hidden="true" size={16} />
                      </a>
                    ) : null}
                  </div>
                ) : null}

                {activeTab === 'discussion' ? (
                  <div className="challenge-resource-state challenge-resource-state--discussion">
                    <span>
                      <MessageCircle aria-hidden="true" size={26} />
                    </span>
                    <div>
                      <small>Comunidade da aula</small>
                      <h2>Discussão ainda não disponível</h2>
                      <p>
                        O espaço para dúvidas e troca de ideias será conectado quando o recurso estiver disponível.
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
              <nav className="lesson-viewer-breadcrumb" aria-label="Localização do conteúdo">
                <Link to={`/trilhas/${track.id}`}>{track.title}</Link>
                <ChevronRight aria-hidden="true" size={13} />
                <Link to={`/trilhas/${track.id}/modulos/${module.id}`}>
                  {module.title}
                </Link>
              </nav>
              <h1>{content.title}</h1>
              <p>
                Prof. {teacherName} <span aria-hidden="true">•</span> {department}
              </p>
            </header>

            <div
              className={`lesson-viewer-stage${
                isNativeArticle ? ' lesson-viewer-stage--external' : ''
              }`}
            >
              <span className="lesson-viewer-position">
                Módulo {currentModuleIndex + 1} · Aula {currentLessonIndex + 1} de{' '}
                {module.contents?.length ?? navigation.modules[currentModuleIndex]?.contents.length ?? 0}
              </span>
              <ContentViewer
                content={content}
                onVideoEnd={handleVideoEnd}
              />
            </div>

            <section
              className={`lesson-information${
                isNativeArticle ? ' lesson-information--external' : ''
              }`}
            >
              <div className="lesson-information__toolbar">
                <div className="lesson-information__tabs" role="tablist" aria-label="Informações da aula">
                  {([
                    ['about', isNativeArticle ? 'Detalhes' : 'Sobre a aula'],
                    ['materials', 'Materiais'],
                    ['discussion', 'Discussão'],
                  ] as const).map(([value, label]) => (
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
                    disabled={
                      completionMutation.isPending
                    }
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
                      <span>{contentTypeMeta[content.content_type ?? 'VIDEO'].label}</span>
                    </div>
                    {isNativeArticle ? null : splitParagraphs(content.description).length > 0 ? (
                      splitParagraphs(content.description).map((paragraph, index) => (
                        <p key={`${paragraph}-${index}`}>{paragraph}</p>
                      ))
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
                      <p>O upload e a listagem de anexos serão conectados em uma próxima etapa.</p>
                    </div>
                  </div>
                ) : null}

                {activeTab === 'discussion' ? (
                  <div className="lesson-information__empty">
                    <CircleAlert aria-hidden="true" size={24} />
                    <div>
                      <strong>Discussão ainda não disponível</strong>
                      <p>O espaço de conversa desta aula será conectado em uma próxima etapa.</p>
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
          <div className="lesson-sidebar__progress" aria-label={`${Math.round(progress)}% concluído`}>
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
                  const target = navigation.contents
                    .find(({ content: currentContent }) => currentContent.id === sidebarContent.id)
                  const isCompleted = Boolean(target?.completed)
                  const isLocked = !isCurrent && Boolean(target?.locked)
                  const meta = contentTypeMeta[sidebarContent.content_type ?? 'VIDEO']
                  const Icon = isLocked ? LockKeyhole : isCompleted ? Check : meta.Icon

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
                      <span className={`lesson-sidebar-item__icon ${meta.className}`}>
                        <Icon aria-hidden="true" size={14} />
                      </span>
                      <span className="lesson-sidebar-item__copy">
                        <strong>{sidebarContent.title}</strong>
                        <small>{formatDuration(sidebarContent.duration_minutes)}</small>
                      </span>
                      <span className="lesson-sidebar-item__type">{meta.label}</span>
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
