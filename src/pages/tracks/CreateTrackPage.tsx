import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Code2,
  FileText,
  GripVertical,
  Play,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '../../components/atoms/Button'
import { StatusBadge } from '../../components/atoms/StatusBadge'
import {
  TechIcon,
  TechTag,
  techIconColors,
  type TechIconName,
} from '../../components/atoms/TechTag'
import { techIcons } from '../../components/atoms/TechTag/TechIcon.colors'
import { tracksQueryKeys } from '../../hooks/useTracks'
import {
  createContent,
  createModule,
  createTrack,
  deleteContent,
  deleteModule,
  deleteTrack,
  getSkills,
  getTrackDraftById,
  publishTrack,
  updateContent,
  updateModule,
  updateTrack,
  type ApiContent,
  type ApiModule,
  type ApiSkill,
  type CreateContentPayload,
  type CreateTrackPayload,
} from '../../services/tracks'
import type { TrackLevel, TrailLessonType } from '../../types/tracks'
import './CreateTrackPage.css'

type Visibility = 'enrolled' | 'draft'

interface EvaluationCriterion {
  id: string
  label: string
  percentage: number
}

interface DraftContent {
  id: string
  title: string
  type: TrailLessonType
  description: string
  articleContent: string
  contentUrl: string
  estimatedDuration: string
  visibility: Visibility
  instructions: string
  language: string
  criteria: EvaluationCriterion[]
  isPersisted: boolean
}

interface DraftModule {
  id: string
  title: string
  description: string
  displayOrder: number
  contents: DraftContent[]
  isPersisted: boolean
}

interface PublicationValidationError {
  field: string
  message: string
  moduleId?: string
  contentId?: string
}

interface ContentTypeConfig {
  label: string
  Icon: LucideIcon
  tone: 'blue' | 'green' | 'yellow' | 'red' | 'violet'
}

const CONTENT_TYPE_CONFIG: Record<TrailLessonType, ContentTypeConfig> = {
  VIDEO: {
    label: 'Vídeo',
    Icon: Play,
    tone: 'blue',
  },
  ARTICLE: {
    label: 'Artigo',
    Icon: FileText,
    tone: 'green',
  },
  CHALLENGE: {
    label: 'Desafio',
    Icon: Zap,
    tone: 'red',
  },
}

const CONTENT_TYPE_OPTIONS = Object.entries(CONTENT_TYPE_CONFIG).map(
  ([value, config]) => ({
    value: value as TrailLessonType,
    label: config.label,
  }),
)

const VISIBILITY_OPTIONS: Array<{ value: Visibility; label: string }> = [
  { value: 'enrolled', label: 'Visível para matriculados' },
  { value: 'draft', label: 'Manter como rascunho' },
]

const TRACK_LEVEL_OPTIONS: Array<{ value: TrackLevel; label: string }> = [
  { value: 'BEGINNER', label: 'Iniciante' },
  { value: 'INTERMEDIATE', label: 'Intermediário' },
  { value: 'ADVANCED', label: 'Avançado' },
]

const DEFAULT_TRACK_TITLE = 'Nova trilha'
const DEFAULT_TRACK_DESCRIPTION = 'Trilha em construção.'
const DEFAULT_MODULE_DESCRIPTION = 'Módulo em construção.'
const DEFAULT_CONTENT_DESCRIPTION = 'Conteúdo em construção.'
const MINIMUM_MODULES_TO_PUBLISH = 2
const MINIMUM_CONTENTS_PER_MODULE = 2

function getContentTypeConfig(type: TrailLessonType) {
  return CONTENT_TYPE_CONFIG[type]
}

function getContentPosition(modules: DraftModule[], contentId: string) {
  return modules
    .flatMap((module) => module.contents.map((content) => content.id))
    .findIndex((id) => id === contentId)
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
}

function parseDurationMinutes(value: string) {
  const match = value.trim().match(/^(\d+)/)

  if (!match) {
    return null
  }

  const minutes = Number(match[0])

  return Number.isFinite(minutes) && minutes > 0 ? minutes : null
}

function parseDurationWeeks(value: string) {
  const weeks = Number(value)

  return Number.isInteger(weeks) && weeks > 0 ? weeks : null
}

function formatDuration(minutes?: number | null) {
  return minutes ? `${minutes} min` : ''
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function isValidYouTubeUrl(value: string) {
  if (!isValidHttpUrl(value)) {
    return false
  }

  const url = new URL(value)
  const hostname = url.hostname.replace(/^www\./, '').toLowerCase()

  if (hostname === 'youtu.be') {
    return Boolean(url.pathname.split('/').filter(Boolean)[0])
  }

  if (
    hostname !== 'youtube.com' &&
    hostname !== 'm.youtube.com' &&
    hostname !== 'youtube-nocookie.com'
  ) {
    return false
  }

  if (url.pathname === '/watch') {
    return Boolean(url.searchParams.get('v'))
  }

  const [route, videoId] = url.pathname.split('/').filter(Boolean)
  return ['embed', 'shorts', 'live'].includes(route ?? '') && Boolean(videoId)
}

function isGeneratedTitle(value: string, prefix: string) {
  return normalizeText(value.trim()).startsWith(normalizeText(prefix))
}

function validateTrackForPublication({
  description,
  durationWeeks,
  modules,
  selectedSkills,
  title,
}: {
  description: string
  durationWeeks: string
  modules: DraftModule[]
  selectedSkills: ApiSkill[]
  title: string
}): PublicationValidationError[] {
  const errors: PublicationValidationError[] = []

  if (!title.trim() || title.trim() === DEFAULT_TRACK_TITLE) {
    errors.push({ field: 'track-title', message: 'Informe o título da trilha.' })
  }

  if (!description.trim() || description.trim() === DEFAULT_TRACK_DESCRIPTION) {
    errors.push({
      field: 'track-description',
      message: 'Informe a descrição da trilha.',
    })
  }

  if (selectedSkills.length === 0) {
    errors.push({
      field: 'track-skills',
      message: 'Selecione pelo menos uma tecnologia.',
    })
  }

  if (!parseDurationWeeks(durationWeeks)) {
    errors.push({
      field: 'track-duration',
      message: 'A duração da trilha deve ser maior que zero.',
    })
  }

  if (modules.length < MINIMUM_MODULES_TO_PUBLISH) {
    errors.push({
      field: 'track-modules',
      message: `Crie pelo menos ${MINIMUM_MODULES_TO_PUBLISH} módulos.`,
    })
  }

  modules.forEach((module, moduleIndex) => {
    const moduleLabel = `Módulo ${moduleIndex + 1}`

    if (!module.title.trim() || isGeneratedTitle(module.title, 'Novo módulo')) {
      errors.push({
        field: 'module-title',
        message: `${moduleLabel}: informe um título próprio.`,
        moduleId: module.id,
      })
    }

    if (module.contents.length < MINIMUM_CONTENTS_PER_MODULE) {
      errors.push({
        field: 'module-contents',
        message: `${moduleLabel}: adicione pelo menos ${MINIMUM_CONTENTS_PER_MODULE} conteúdos.`,
        moduleId: module.id,
      })
    }

    module.contents.forEach((content, contentIndex) => {
      const contentLabel = `${moduleLabel}, conteúdo ${contentIndex + 1}`
      const validationContext = {
        moduleId: module.id,
        contentId: content.id,
      }

      if (!content.title.trim() || isGeneratedTitle(content.title, 'Novo conteúdo')) {
        errors.push({
          ...validationContext,
          field: 'content-title',
          message: `${contentLabel}: informe um título próprio.`,
        })
      }

      const requiredDescription =
        content.type === 'ARTICLE' ? content.articleContent : content.description
      if (
        !requiredDescription.trim() ||
        requiredDescription.trim() === DEFAULT_CONTENT_DESCRIPTION
      ) {
        errors.push({
          ...validationContext,
          field:
            content.type === 'ARTICLE'
              ? 'content-markdown'
              : 'content-description',
          message:
            content.type === 'ARTICLE'
              ? `${contentLabel}: escreva o conteúdo do artigo.`
              : `${contentLabel}: informe uma descrição.`,
        })
      }

      if (!parseDurationMinutes(content.estimatedDuration)) {
        errors.push({
          ...validationContext,
          field: 'content-duration',
          message: `${contentLabel}: informe uma duração estimada maior que zero.`,
        })
      }

      if (content.type === 'VIDEO' && !isValidYouTubeUrl(content.contentUrl.trim())) {
        errors.push({
          ...validationContext,
          field: 'content-url',
          message: `${contentLabel}: informe uma URL válida do YouTube.`,
        })
      }

      if (content.type === 'CHALLENGE') {
        if (!content.instructions.trim()) {
          errors.push({
            ...validationContext,
            field: 'content-instructions',
            message: `${contentLabel}: escreva o enunciado do desafio.`,
          })
        }

        const hasUnnamedCriterion = content.criteria.some(
          (criterion) => !criterion.label.trim(),
        )
        const criteriaTotal = content.criteria.reduce(
          (total, criterion) => total + Number(criterion.percentage),
          0,
        )
        if (hasUnnamedCriterion || criteriaTotal !== 100) {
          errors.push({
            ...validationContext,
            field: 'content-criteria',
            message: `${contentLabel}: nomeie os critérios e distribua exatamente 100%.`,
          })
        }
      }
    })
  })

  return errors
}

function normalizeMultilineList(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function clampPercentage(value: number) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.min(100, Math.max(0, value))
}

function criteriaToApi(criteria: EvaluationCriterion[]) {
  return criteria.reduce<Record<string, number>>((payload, criterion) => {
    const label = criterion.label.trim()

    if (label) {
      payload[label] = clampPercentage(Number(criterion.percentage))
    }

    return payload
  }, {})
}

function apiCriteriaToDraft(criteria?: Record<string, number>) {
  return Object.entries(criteria ?? {}).map(([label, percentage], index) => ({
    id: `criterion-${index}-${normalizeText(label)}`,
    label,
    percentage,
  }))
}

function getDefaultCriteria() {
  return [
    { id: `criterion-quality-${Date.now()}`, label: 'Qualidade', percentage: 40 },
    { id: `criterion-tests-${Date.now()}`, label: 'Testes', percentage: 30 },
    {
      id: `criterion-docs-${Date.now()}`,
      label: 'Documentação',
      percentage: 30,
    },
  ]
}

function mapApiContentToDraft(content: ApiContent): DraftContent {
  return {
    id: content.id,
    title: content.title,
    type: content.content_type ?? 'VIDEO',
    description: content.description ?? '',
    articleContent: content.content ?? content.description ?? '',
    contentUrl: content.content_url ?? '',
    estimatedDuration: formatDuration(content.duration_minutes),
    visibility: content.visibility ?? 'enrolled',
    instructions: content.instructions ?? '',
    language: content.language ?? 'Python',
    criteria: apiCriteriaToDraft(content.evaluation_criteria),
    isPersisted: true,
  }
}

function mapApiModuleToDraft(module: ApiModule): DraftModule {
  return {
    id: module.id,
    title: module.title,
    description: module.description ?? '',
    displayOrder: module.display_order ?? 1,
    contents: (module.contents ?? []).map(mapApiContentToDraft),
    isPersisted: true,
  }
}

function getSkillIconName(skill: ApiSkill): TechIconName | null {
  const aliases: Record<string, TechIconName> = {
    fastapi: 'fastapi',
    docker: 'docker',
    postgresql: 'postgresql',
    postgres: 'postgresql',
    python: 'python',
    rest: 'swagger',
    react: 'react',
    typescript: 'typescript',
    javascript: 'nodejs',
  }
  const normalizedSlug = normalizeText(skill.slug || skill.name)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const iconName = aliases[normalizedSlug] ?? normalizedSlug

  return iconName in techIcons ? (iconName as TechIconName) : null
}

function getSkillCategory(skill: ApiSkill) {
  const normalized = normalizeText(skill.name)

  if (/(python|javascript|typescript|java|go|rust|php)/.test(normalized)) {
    return 'language'
  }

  if (/(fastapi|react|django|spring|next)/.test(normalized)) {
    return 'framework'
  }

  if (/(docker|postgres|kubernetes|redis|linux)/.test(normalized)) {
    return 'infra'
  }

  return 'tool'
}

function getContentPayload(
  content: DraftContent,
  moduleId: string,
  displayOrder: number,
): CreateContentPayload {
  const payload: CreateContentPayload = {
    module: moduleId,
    title: content.title.trim() || 'Novo conteúdo',
    description:
      content.type === 'ARTICLE'
        ? content.articleContent.trim() || DEFAULT_CONTENT_DESCRIPTION
        : content.description.trim() || DEFAULT_CONTENT_DESCRIPTION,
    content_type: content.type,
    duration_minutes: parseDurationMinutes(content.estimatedDuration),
    display_order: displayOrder,
  }

  if (content.type === 'CHALLENGE') {
    payload.instructions = content.instructions.trim()
    payload.language = content.language.trim() || 'Python'
    payload.evaluation_criteria = criteriaToApi(content.criteria)
  } else if (content.type === 'ARTICLE') {
    payload.content = content.articleContent.trim()
  } else if (content.type === 'VIDEO') {
    if (content.contentUrl.trim()) {
      payload.content_url = content.contentUrl.trim()
    }

    payload.visibility = content.visibility
  }

  return payload
}

function formatResponseError(data: unknown) {
  if (typeof data === 'string') {
    return 'O serviço de trilhas retornou uma resposta inesperada.'
  }

  if (!data || typeof data !== 'object') {
    return null
  }

  const detail = 'detail' in data ? data.detail : null
  if (typeof detail === 'string') {
    return detail
  }

  const fieldMessages = Object.entries(data)
    .flatMap(([field, value]) => {
      const messages = Array.isArray(value) ? value : [value]
      return messages
        .filter((message): message is string => typeof message === 'string')
        .map((message) => `${field}: ${message}`)
    })

  return fieldMessages.length > 0 ? fieldMessages.join(' ') : null
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = error.response

    if (response && typeof response === 'object' && 'data' in response) {
      const responseMessage = formatResponseError(response.data)
      if (responseMessage) {
        return responseMessage
      }
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Não foi possível concluir a ação.'
}

export default function CreateTrackPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { trackId: routeTrackId } = useParams()
  const isEditMode = Boolean(routeTrackId)
  const [trackId, setTrackId] = useState<string | null>(routeTrackId ?? null)
  const [trackStatus, setTrackStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT')
  const [trackTitle, setTrackTitle] = useState('')
  const [trackDescription, setTrackDescription] = useState('')
  const [trackLevel, setTrackLevel] = useState<TrackLevel>('BEGINNER')
  const [trackDurationWeeks, setTrackDurationWeeks] = useState('1')
  const [trackOutcomes, setTrackOutcomes] = useState('')
  const [trackPrerequisites, setTrackPrerequisites] = useState('')
  const [skills, setSkills] = useState<ApiSkill[]>([])
  const [selectedSkills, setSelectedSkills] = useState<ApiSkill[]>([])
  const [skillToAddId, setSkillToAddId] = useState('')
  const [modules, setModules] = useState<DraftModule[]>([])
  const [selectedModuleId, setSelectedModuleId] = useState('')
  const [selectedContentId, setSelectedContentId] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoadingTrack, setIsLoadingTrack] = useState(isEditMode)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showPublicationErrors, setShowPublicationErrors] = useState(false)

  useEffect(() => {
    document.title = isEditMode ? 'ATLAS - Editar trilha' : 'ATLAS - Criar trilha'

    void getSkills()
      .then(setSkills)
      .catch(() => setSkills([]))

    if (!routeTrackId) {
      return
    }

    let isCancelled = false

    void getTrackDraftById(routeTrackId)
      .then((track) => {
        if (isCancelled) {
          return
        }

        const draftModules = [...(track.modules ?? [])]
          .sort(
            (first, second) =>
              (first.display_order ?? 0) - (second.display_order ?? 0),
          )
          .map(mapApiModuleToDraft)
        const firstModule = draftModules[0]

        setTrackId(track.id)
        setTrackStatus(track.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT')
        setTrackTitle(track.title ?? '')
        setTrackDescription(track.description ?? '')
        setTrackLevel(
          TRACK_LEVEL_OPTIONS.some((option) => option.value === track.level)
            ? (track.level as TrackLevel)
            : 'BEGINNER',
        )
        setTrackDurationWeeks(String(track.duration_weeks ?? 1))
        setTrackOutcomes((track.outcomes ?? []).join('\n'))
        setTrackPrerequisites((track.prerequisites ?? []).join('\n'))
        setSelectedSkills(track.skills ?? [])
        setModules(draftModules)
        setSelectedModuleId(firstModule?.id ?? '')
        setSelectedContentId(firstModule?.contents[0]?.id ?? '')
      })
      .catch((error) => {
        if (!isCancelled) {
          setErrorMessage(getErrorMessage(error))
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingTrack(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [isEditMode, routeTrackId])

  const selectedModule = useMemo(
    () => modules.find((module) => module.id === selectedModuleId) ?? null,
    [modules, selectedModuleId],
  )

  const selectedContent = useMemo(
    () =>
      selectedModule?.contents.find(
        (content) => content.id === selectedContentId,
      ) ?? null,
    [selectedContentId, selectedModule],
  )

  const allContentIds = useMemo(
    () => modules.flatMap((module) => module.contents.map((content) => content.id)),
    [modules],
  )

  const selectedContentIndex = selectedContent
    ? getContentPosition(modules, selectedContent.id)
    : -1
  const isFirstContent = selectedContentIndex <= 0
  const isLastContent =
    selectedContentIndex === -1 || selectedContentIndex === allContentIds.length - 1
  const publicationErrors = useMemo(
    () =>
      showPublicationErrors
        ? validateTrackForPublication({
            description: trackDescription,
            durationWeeks: trackDurationWeeks,
            modules,
            selectedSkills,
            title: trackTitle,
          })
        : [],
    [
      modules,
      selectedSkills,
      showPublicationErrors,
      trackDescription,
      trackDurationWeeks,
      trackTitle,
    ],
  )

  function hasPublicationError(
    field: string,
    moduleId?: string,
    contentId?: string,
  ) {
    return publicationErrors.some(
      (error) =>
        error.field === field &&
        (!moduleId || error.moduleId === moduleId) &&
        (!contentId || error.contentId === contentId),
    )
  }

  function revealPublicationError(error: PublicationValidationError) {
    if (error.moduleId) {
      setSelectedModuleId(error.moduleId)
    }
    if (error.contentId) {
      setSelectedContentId(error.contentId)
    }

    window.requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(`[data-validation-field="${error.field}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  async function persistTrack() {
    const durationWeeks = parseDurationWeeks(trackDurationWeeks) ?? 1

    const payload: CreateTrackPayload = {
      title: trackTitle.trim() || DEFAULT_TRACK_TITLE,
      description: trackDescription.trim() || DEFAULT_TRACK_DESCRIPTION,
      level: trackLevel,
      duration_weeks: durationWeeks,
      skill_ids: selectedSkills.map((skill) => skill.id),
      outcomes: normalizeMultilineList(trackOutcomes),
      prerequisites: normalizeMultilineList(trackPrerequisites),
    }

    if (!trackId) {
      const createdTrack = await createTrack(payload)
      setTrackId(createdTrack.id)
      setTrackStatus(createdTrack.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT')
      return createdTrack
    }

    const updatedTrack = await updateTrack(trackId, payload)
    setTrackStatus(updatedTrack.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT')
    return updatedTrack
  }

  async function persistModulesAndContents() {
    await Promise.all(
      modules.map(async (module) => {
        if (module.isPersisted) {
          await updateModule(module.id, {
            title: module.title.trim() || 'Novo módulo',
            description: module.description.trim() || DEFAULT_MODULE_DESCRIPTION,
            display_order: module.displayOrder,
          })
        }

        await Promise.all(
          module.contents.map((content, contentIndex) =>
            content.isPersisted
              ? updateContent(
                  content.id,
                  getContentPayload(content, module.id, contentIndex + 1),
                )
              : Promise.resolve(),
          ),
        )
      }),
    )
  }

  async function handleSaveTrack() {
    const validationErrors = validateTrackForPublication({
      description: trackDescription,
      durationWeeks: trackDurationWeeks,
      modules,
      selectedSkills,
      title: trackTitle,
    })

    if (validationErrors.length > 0) {
      setShowPublicationErrors(true)
      setMessage('')
      setErrorMessage('')
      revealPublicationError(validationErrors[0])
      return
    }

    setIsSaving(true)
    setShowPublicationErrors(false)
    setErrorMessage('')
    setMessage('')

    try {
      const track = await persistTrack()
      await persistModulesAndContents()

      if (isEditMode && trackStatus === 'PUBLISHED') {
        await queryClient.invalidateQueries({ queryKey: tracksQueryKeys.all })
        setMessage('Alterações salvas.')
        navigate(`/trilhas/${track.id}`)
        return
      }

      const publishedTrack = await publishTrack(track.id)
      setTrackStatus('PUBLISHED')
      await queryClient.invalidateQueries({ queryKey: tracksQueryKeys.all })
      setMessage('Trilha publicada.')
      navigate(`/trilhas/${publishedTrack.id}`)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSaveDraft() {
    setIsSaving(true)
    setShowPublicationErrors(false)
    setErrorMessage('')
    setMessage('')

    try {
      await persistTrack()
      await persistModulesAndContents()
      await queryClient.invalidateQueries({ queryKey: tracksQueryKeys.all })
      setMessage(
        trackStatus === 'PUBLISHED' ? 'Alterações salvas.' : 'Rascunho salvo.',
      )
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteTrack() {
    if (!trackId) {
      return
    }

    const confirmed = window.confirm(
      `Excluir a trilha “${trackTitle.trim() || DEFAULT_TRACK_TITLE}”?\n\n` +
        'Esta ação também remove seus módulos e conteúdos e não pode ser desfeita. ' +
        'Trilhas com alunos em andamento não podem ser excluídas.',
    )

    if (!confirmed) {
      return
    }

    setIsDeleting(true)
    setErrorMessage('')
    setMessage('')

    try {
      await deleteTrack(trackId)
      await queryClient.invalidateQueries({ queryKey: tracksQueryKeys.all })
      navigate('/trilhas', {
        replace: true,
        state: { message: 'Trilha excluída.' },
      })
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleDeleteModule(moduleToDelete: DraftModule | null = selectedModule) {
    if (!moduleToDelete) {
      return
    }

    const confirmed = window.confirm(
      `Excluir o módulo “${moduleToDelete.title}”?\n\n` +
        `Os ${moduleToDelete.contents.length} conteúdo(s) deste módulo também serão excluídos. ` +
        'Esta ação não pode ser desfeita.',
    )

    if (!confirmed) {
      return
    }

    setIsSaving(true)
    setErrorMessage('')
    setMessage('')

    try {
      if (moduleToDelete.isPersisted) {
        await deleteModule(moduleToDelete.id)
      }

      const deletedIndex = modules.findIndex(
        (module) => module.id === moduleToDelete.id,
      )
      const remainingModules = modules.filter(
        (module) => module.id !== moduleToDelete.id,
      )
      const nextModule =
        remainingModules[deletedIndex] ??
        remainingModules[Math.max(0, deletedIndex - 1)]
      const deletedSelectedModule = moduleToDelete.id === selectedModule?.id

      setModules(remainingModules)
      if (deletedSelectedModule) {
        setSelectedModuleId(nextModule?.id ?? '')
        setSelectedContentId(nextModule?.contents[0]?.id ?? '')
      }
      await queryClient.invalidateQueries({ queryKey: tracksQueryKeys.all })
      setMessage('Módulo excluído.')
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  function handleSkillSelect(event: ChangeEvent<HTMLSelectElement>) {
    const skillId = event.target.value
    const skill = skills.find((currentSkill) => currentSkill.id === skillId)

    if (!skill) {
      return
    }

    setSelectedSkills((currentSkills) =>
      currentSkills.some((currentSkill) => currentSkill.id === skill.id)
        ? currentSkills
        : [...currentSkills, skill],
    )
    setSkillToAddId('')
  }

  function removeSkill(skillId: string) {
    setSelectedSkills((currentSkills) =>
      currentSkills.filter((skill) => skill.id !== skillId),
    )
  }

  async function handleCreateModule() {
    setIsSaving(true)
    setErrorMessage('')
    setMessage('')

    try {
      const track = await persistTrack()
      const createdModule = await createModule({
        track: track.id,
        title: `Novo módulo ${modules.length + 1}`,
        description: DEFAULT_MODULE_DESCRIPTION,
        display_order: modules.length + 1,
      })
      const draftModule = mapApiModuleToDraft(createdModule)

      setModules((currentModules) => [...currentModules, draftModule])
      setSelectedModuleId(draftModule.id)
      setSelectedContentId('')
      setMessage('Módulo criado.')
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleModuleTitleBlur(module: DraftModule) {
    if (!module.isPersisted) {
      return
    }

    try {
      await updateModule(module.id, {
        title: module.title.trim() || 'Novo módulo',
        description: module.description.trim() || DEFAULT_MODULE_DESCRIPTION,
        display_order: module.displayOrder,
      })
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    }
  }

  async function handleAddContent() {
    if (!selectedModule) {
      return
    }

    setIsSaving(true)
    setErrorMessage('')
    setMessage('')

    try {
      const draftContent: DraftContent = {
        id: `content-${Date.now()}`,
        title: `Novo conteúdo ${selectedModule.contents.length + 1}`,
        type: 'VIDEO',
        description: DEFAULT_CONTENT_DESCRIPTION,
        articleContent: '',
        contentUrl: '',
        estimatedDuration: '',
        visibility: 'enrolled',
        instructions: '',
        language: 'Python',
        criteria: getDefaultCriteria(),
        isPersisted: false,
      }
      const createdContent = await createContent(
        getContentPayload(
          draftContent,
          selectedModule.id,
          selectedModule.contents.length + 1,
        ),
      )
      const nextContent = mapApiContentToDraft(createdContent)

      setModules((currentModules) =>
        currentModules.map((module) =>
          module.id === selectedModule.id
            ? { ...module, contents: [...module.contents, nextContent] }
            : module,
        ),
      )
      setSelectedContentId(nextContent.id)
      setMessage('Conteúdo criado.')
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  function updateSelectedContent(updates: Partial<DraftContent>) {
    if (!selectedContent) {
      return
    }

    setModules((currentModules) =>
      currentModules.map((module) => ({
        ...module,
        contents: module.contents.map((content) =>
          content.id === selectedContent.id ? { ...content, ...updates } : content,
        ),
      })),
    )
  }

  async function handleDeleteContent() {
    if (!selectedModule || !selectedContent) {
      return
    }

    setIsSaving(true)
    setErrorMessage('')
    setMessage('')

    try {
      await deleteContent(selectedContent.id)
      const nextContents = selectedModule.contents.filter(
        (content) => content.id !== selectedContent.id,
      )

      setModules((currentModules) =>
        currentModules.map((module) =>
          module.id === selectedModule.id
            ? { ...module, contents: nextContents }
            : module,
        ),
      )
      setSelectedContentId(nextContents[0]?.id ?? '')
      setMessage('Conteúdo excluído.')
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  function handleContentTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextType = event.target.value as TrailLessonType

    updateSelectedContent({
      type: nextType,
      articleContent:
        nextType === 'ARTICLE' && !selectedContent?.articleContent.trim()
          ? selectedContent?.description === DEFAULT_CONTENT_DESCRIPTION
            ? ''
            : selectedContent?.description ?? ''
          : selectedContent?.articleContent ?? '',
      contentUrl:
        nextType === 'VIDEO' ? selectedContent?.contentUrl ?? '' : '',
      criteria:
        nextType === 'CHALLENGE'
          ? selectedContent?.criteria.length
            ? selectedContent.criteria
            : getDefaultCriteria()
          : [],
    })
  }

  function navigateContent(direction: 'previous' | 'next') {
    const nextIndex =
      direction === 'previous' ? selectedContentIndex - 1 : selectedContentIndex + 1
    const nextContentId = allContentIds[nextIndex]

    if (!nextContentId) {
      return
    }

    const nextModule = modules.find((module) =>
      module.contents.some((content) => content.id === nextContentId),
    )

    if (!nextModule) {
      return
    }

    setSelectedModuleId(nextModule.id)
    setSelectedContentId(nextContentId)
  }

  function addCriterion() {
    if (!selectedContent || selectedContent.type !== 'CHALLENGE') {
      return
    }

    updateSelectedContent({
      criteria: [
        ...selectedContent.criteria,
        {
          id: `criterion-${Date.now()}`,
          label: 'Novo critério',
          percentage: 0,
        },
      ],
    })
  }

  function updateCriterion(
    criterionId: string,
    updates: Partial<EvaluationCriterion>,
  ) {
    if (!selectedContent) {
      return
    }

    updateSelectedContent({
      criteria: selectedContent.criteria.map((criterion) =>
        criterion.id === criterionId ? { ...criterion, ...updates } : criterion,
      ),
    })
  }

  function removeCriterion(criterionId: string) {
    if (!selectedContent) {
      return
    }

    updateSelectedContent({
      criteria: selectedContent.criteria.filter(
        (criterion) => criterion.id !== criterionId,
      ),
    })
  }

  const SelectedContentIcon = selectedContent
    ? getContentTypeConfig(selectedContent.type).Icon
    : Code2
  const contentTypeLabel = selectedContent
    ? getContentTypeConfig(selectedContent.type).label
    : 'Conteúdo'
  const statusLabel = trackStatus === 'PUBLISHED' ? 'Publicado' : 'Rascunho'

  if (isLoadingTrack) {
    return (
      <main className="create-track-page">
        <div className="create-track-feedback" role="status">
          Carregando trilha para edição...
        </div>
      </main>
    )
  }

  return (
    <main className="create-track-page">
      <header className="create-track-header">
        <div className="create-track-topbar">
          <div className="create-track-title-block">
            <div className="create-track-title-row">
              <h1>{trackTitle.trim() || DEFAULT_TRACK_TITLE}</h1>
              <StatusBadge
                className="create-track-status"
                status={trackStatus === 'PUBLISHED' ? 'success' : 'neutral'}
                size="sm"
              >
                {statusLabel}
              </StatusBadge>
            </div>

            <div className="create-track-tags" aria-label="Tecnologias da trilha">
              <span className="create-track-tags__label">Tecnologias *</span>
              {selectedSkills.map((skill) => {
                const iconName = getSkillIconName(skill)

                return (
                  <span className="create-track-tech-tag" key={skill.id}>
                    <TechTag
                      accentColor={
                        iconName ? techIconColors[iconName] : undefined
                      }
                      category={getSkillCategory(skill)}
                      icon={iconName ? <TechIcon name={iconName} /> : undefined}
                      variant="tinted"
                    >
                      {skill.name}
                    </TechTag>
                    <button
                      type="button"
                      aria-label={`Remover ${skill.name}`}
                      onClick={() => removeSkill(skill.id)}
                    >
                      <X aria-hidden="true" size={13} />
                    </button>
                  </span>
                )
              })}

              <label className="create-track-add-tag">
                <Plus aria-hidden="true" size={13} />
                <select
                  aria-label="Adicionar tecnologia da trilha"
                  aria-invalid={hasPublicationError('track-skills')}
                  data-validation-field="track-skills"
                  value={skillToAddId}
                  onChange={handleSkillSelect}
                >
                  <option value="">Tecnologia</option>
                  {skills
                    .filter(
                      (skill) =>
                        !selectedSkills.some(
                          (selectedSkill) => selectedSkill.id === skill.id,
                        ),
                    )
                    .map((skill) => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name}
                      </option>
                    ))}
                </select>
              </label>
            </div>
          </div>

          <div className="create-track-header__actions">
            {isEditMode && trackId ? (
              <Button
                iconLeft={Trash2}
                loading={isDeleting}
                size="md"
                variant="danger"
                disabled={isSaving}
                onClick={handleDeleteTrack}
              >
                Excluir trilha
              </Button>
            ) : null}
            {trackStatus === 'DRAFT' ? (
              <Button
                iconLeft={Save}
                loading={isSaving}
                size="md"
                variant="outline"
                disabled={isDeleting}
                onClick={handleSaveDraft}
              >
                Salvar rascunho
              </Button>
            ) : null}
            <Button
              loading={isSaving}
              size="md"
              variant="primary"
              disabled={isDeleting}
              onClick={handleSaveTrack}
            >
              {isEditMode && trackStatus === 'PUBLISHED'
                ? 'Salvar alterações'
                : 'Publicar trilha'}
            </Button>
          </div>
        </div>

        <section
          className="create-track-settings"
          aria-labelledby="create-track-settings-title"
        >
          <h2 id="create-track-settings-title">Configurações da trilha</h2>

          <div className="create-track-settings__content">
            <div className="create-track-settings__column">
              <label className="create-track-field">
                <span>Título da Trilha *</span>
                <input
                  aria-invalid={hasPublicationError('track-title')}
                  data-validation-field="track-title"
                  value={trackTitle}
                  placeholder={DEFAULT_TRACK_TITLE}
                  onChange={(event) => setTrackTitle(event.target.value)}
                />
              </label>

              <label className="create-track-field">
                <span>Descrição Curta *</span>
                <textarea
                  aria-invalid={hasPublicationError('track-description')}
                  data-validation-field="track-description"
                  rows={4}
                  value={trackDescription}
                  placeholder="Escreva uma breve descrição para o catálogo..."
                  onChange={(event) => setTrackDescription(event.target.value)}
                />
              </label>
            </div>

            <div className="create-track-settings__column">
              <div className="create-track-meta-grid">
                <div className="create-track-field">
                  <span>Nível</span>
                  <div
                    className="create-track-level-options"
                    role="radiogroup"
                    aria-label="Nível da trilha"
                  >
                    {TRACK_LEVEL_OPTIONS.map((option) => (
                      <button
                        className={
                          trackLevel === option.value ? 'is-selected' : ''
                        }
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={trackLevel === option.value}
                        onClick={() => setTrackLevel(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="create-track-field">
                  <span>Duração (semanas) *</span>
                  <input
                    aria-invalid={hasPublicationError('track-duration')}
                    data-validation-field="track-duration"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={trackDurationWeeks}
                    onChange={(event) =>
                      setTrackDurationWeeks(event.target.value.replace(/\D/g, ''))
                    }
                  />
                </label>
              </div>

              <div className="create-track-list-grid">
                <label className="create-track-field">
                  <span>O que o aluno vai aprender</span>
                  <textarea
                    rows={4}
                    value={trackOutcomes}
                    placeholder="Liste os resultados esperados, um por linha..."
                    onChange={(event) => setTrackOutcomes(event.target.value)}
                  />
                </label>

                <label className="create-track-field">
                  <span>Pré-requisitos</span>
                  <textarea
                    rows={4}
                    value={trackPrerequisites}
                    placeholder="Liste os pré-requisitos, um por linha..."
                    onChange={(event) =>
                      setTrackPrerequisites(event.target.value)
                    }
                  />
                </label>
              </div>
            </div>
          </div>
        </section>
      </header>

      {publicationErrors.length > 0 ? (
        <section className="create-track-validation" role="alert">
          <div>
            <strong>A trilha ainda não pode ser publicada</strong>
            <p>
              Corrija os campos abaixo ou use “Salvar rascunho” para continuar depois.
            </p>
          </div>
          <ul>
            {publicationErrors.map((error, index) => (
              <li key={`${error.field}-${error.moduleId ?? 'track'}-${error.contentId ?? index}`}>
                <button type="button" onClick={() => revealPublicationError(error)}>
                  {error.message}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {message || errorMessage ? (
        <div
          className={`create-track-feedback${
            errorMessage ? ' create-track-feedback--error' : ''
          }`}
          role={errorMessage ? 'alert' : 'status'}
        >
          {errorMessage || message}
        </div>
      ) : null}

      <section className="track-builder" aria-label="Construtor de trilha">
        <aside className="track-builder-panel track-builder-panel--modules">
          <div
            className={`track-builder-panel__header${
              hasPublicationError('track-modules') ? ' has-validation-error' : ''
            }`}
            data-validation-field="track-modules"
          >
            <div>
              <h2>Módulos</h2>
              <p>{modules.length} módulos</p>
            </div>
            <Button
              aria-label="Criar novo módulo"
              className="track-builder-header-add"
              iconLeft={Plus}
              size="sm"
              variant="outline"
              disabled={isSaving}
              onClick={handleCreateModule}
            >
              Novo
            </Button>
          </div>

          <div className="track-builder-list" role="list">
            {modules.length === 0 ? (
              <div className="track-builder-empty">
                Crie o primeiro módulo para começar a montar a trilha.
              </div>
            ) : null}

            {modules.map((module, index) => {
              const isSelected = module.id === selectedModule?.id

              return (
                <div
                  className={`track-builder-item track-builder-item--module-card${
                    isSelected ? ' is-selected' : ''
                  }`}
                  key={module.id}
                >
                  <button
                    className="track-builder-module-select"
                    type="button"
                    aria-label={`Selecionar módulo ${module.title}`}
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelectedModuleId(module.id)
                      setSelectedContentId(module.contents[0]?.id ?? '')
                    }}
                  >
                    <GripVertical
                      className="track-builder-item__drag"
                      aria-hidden="true"
                      size={16}
                    />
                  </button>
                  <span className="track-builder-item__number">{index + 1}</span>
                  <span className="track-builder-item__copy">
                    <input
                      aria-label={`Título do módulo ${index + 1}`}
                      aria-invalid={hasPublicationError(
                        'module-title',
                        module.id,
                      )}
                      data-validation-field={
                        isSelected ? 'module-title' : undefined
                      }
                      value={module.title}
                      onFocus={() => {
                        setSelectedModuleId(module.id)
                        setSelectedContentId(module.contents[0]?.id ?? '')
                      }}
                      onBlur={() => void handleModuleTitleBlur(module)}
                      onChange={(event) =>
                        setModules((currentModules) =>
                          currentModules.map((currentModule) =>
                            currentModule.id === module.id
                              ? { ...currentModule, title: event.target.value }
                              : currentModule,
                          ),
                        )
                      }
                    />
                    <small>{module.contents.length} conteúdos</small>
                  </span>
                  <button
                    className="track-builder-module-delete"
                    type="button"
                    aria-label={`Excluir módulo ${module.title}`}
                    disabled={isSaving}
                    onClick={() => void handleDeleteModule(module)}
                  >
                    <Trash2 aria-hidden="true" size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        </aside>

        <aside className="track-builder-panel track-builder-panel--contents">
          <div
            className={`track-builder-panel__header${
              selectedModule &&
              hasPublicationError('module-contents', selectedModule.id)
                ? ' has-validation-error'
                : ''
            }`}
            data-validation-field="module-contents"
          >
            <div>
              <h2>Conteúdos</h2>
              <p>
                {selectedModule
                  ? `${selectedModule.contents.length} conteúdos · ${selectedModule.title}`
                  : 'Nenhum módulo selecionado'}
              </p>
            </div>
            <Button
              aria-label="Adicionar conteúdo"
              className="track-builder-header-add"
              iconLeft={Plus}
              size="sm"
              variant="outline"
              disabled={!selectedModule || isSaving}
              onClick={handleAddContent}
            >
              Novo
            </Button>
          </div>

          <div className="track-builder-list" role="list">
            {selectedModule && selectedModule.contents.length === 0 ? (
              <div className="track-builder-empty">
                Adicione um conteúdo para editar vídeo, artigo ou desafio.
              </div>
            ) : null}

            {selectedModule?.contents.map((content) => {
              const config = getContentTypeConfig(content.type)
              const Icon = config.Icon
              const isSelected = content.id === selectedContent?.id

              return (
                <button
                  className={`track-builder-item track-builder-item--content${
                    isSelected ? ' is-selected' : ''
                  }`}
                  key={content.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedContentId(content.id)}
                >
                  <GripVertical
                    className="track-builder-item__drag"
                    aria-hidden="true"
                    size={16}
                  />
                  <span
                    className={`track-builder-content-icon track-builder-content-icon--${config.tone}`}
                  >
                    <Icon aria-hidden="true" size={16} />
                  </span>
                  <span className="track-builder-item__copy">
                    <strong>{content.title}</strong>
                    <small>{config.label}</small>
                  </span>
                </button>
              )
            })}
          </div>

        </aside>

        <section className="content-editor-panel">
          <div className="content-editor-panel__header">
            <div className="content-editor-panel__title">
              <span
                className={`track-builder-content-icon track-builder-content-icon--${
                  selectedContent
                    ? getContentTypeConfig(selectedContent.type).tone
                    : 'blue'
                }`}
              >
                <SelectedContentIcon aria-hidden="true" size={17} />
              </span>
              <div>
                <h2>{selectedContent?.title ?? 'Nenhum conteúdo selecionado'}</h2>
                <p>
                  {selectedModule && selectedContent
                    ? `Módulo ${
                        modules.findIndex((module) => module.id === selectedModule.id) + 1
                      } - Conteúdo ${
                        selectedModule.contents.findIndex(
                          (content) => content.id === selectedContent.id,
                        ) + 1
                      } de ${selectedModule.contents.length}`
                    : 'Crie ou selecione um conteúdo para editar'}
                </p>
              </div>
            </div>

            <div className="content-editor-panel__actions">
              <Button
                iconLeft={ChevronLeft}
                size="sm"
                variant="outline"
                disabled={isFirstContent || !selectedContent}
                onClick={() => navigateContent('previous')}
              >
                Anterior
              </Button>
              <Button
                iconRight={ChevronRight}
                size="sm"
                variant="outline"
                disabled={isLastContent || !selectedContent}
                onClick={() => navigateContent('next')}
              >
                Próximo
              </Button>
              <Button
                aria-label="Excluir conteúdo"
                iconLeft={Trash2}
                size="sm"
                variant="danger"
                disabled={!selectedContent || isSaving}
                onClick={handleDeleteContent}
              />
              <Button
                iconLeft={Save}
                size="sm"
                variant="primary"
                loading={isSaving}
                disabled={!selectedContent}
                onClick={handleSaveDraft}
              >
                Salvar
              </Button>
            </div>
          </div>

          {selectedContent ? (
            <form
              className="content-editor-form"
              onSubmit={(event) => event.preventDefault()}
            >
              <div className="content-editor-grid content-editor-grid--two">
                <label className="content-editor-field">
                  <span>Título *</span>
                  <input
                    aria-invalid={hasPublicationError(
                      'content-title',
                      selectedModule?.id,
                      selectedContent.id,
                    )}
                    data-validation-field="content-title"
                    type="text"
                    value={selectedContent.title}
                    onChange={(event) =>
                      updateSelectedContent({ title: event.target.value })
                    }
                  />
                </label>

                <label className="content-editor-field">
                  <span>Tipo de conteúdo *</span>
                  <select
                    value={selectedContent.type}
                    onChange={handleContentTypeChange}
                  >
                    {CONTENT_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {selectedContent.type === 'ARTICLE' ? (
                <label className="content-editor-field content-editor-field--markdown">
                  <span>
                    Conteúdo do artigo * <small>Markdown</small>
                  </span>
                  <textarea
                    aria-invalid={hasPublicationError(
                      'content-markdown',
                      selectedModule?.id,
                      selectedContent.id,
                    )}
                    data-validation-field="content-markdown"
                    value={selectedContent.articleContent}
                    placeholder={'# Título da seção\n\nEscreva o artigo usando **Markdown**.'}
                    rows={16}
                    onChange={(event) =>
                      updateSelectedContent({ articleContent: event.target.value })
                    }
                  />
                  <small className="content-editor-markdown-hint">
                    Use títulos, listas, links, citações e blocos de código para organizar a leitura.
                  </small>
                </label>
              ) : (
                <label className="content-editor-field">
                  <span>
                    Descrição * <small>resumo para o aluno</small>
                  </span>
                  <textarea
                    aria-invalid={hasPublicationError(
                      'content-description',
                      selectedModule?.id,
                      selectedContent.id,
                    )}
                    data-validation-field="content-description"
                    value={selectedContent.description}
                    placeholder="Descreva o que o aluno vai aprender neste conteúdo..."
                    rows={4}
                    onChange={(event) =>
                      updateSelectedContent({ description: event.target.value })
                    }
                  />
                </label>
              )}

              {selectedContent.type === 'CHALLENGE' ? (
                <>
                  <label className="content-editor-field content-editor-field--statement">
                    <span>
                      Enunciado do desafio * <small>texto único apresentado ao aluno</small>
                    </span>
                    <textarea
                      aria-invalid={hasPublicationError(
                        'content-instructions',
                        selectedModule?.id,
                        selectedContent.id,
                      )}
                      data-validation-field="content-instructions"
                      value={selectedContent.instructions}
                      placeholder="Escreva o enunciado completo do desafio. Explique o contexto, o que deve ser desenvolvido, os requisitos técnicos, as regras importantes e o que o aluno deverá entregar."
                      rows={14}
                      onChange={(event) =>
                        updateSelectedContent({ instructions: event.target.value })
                      }
                    />
                  </label>

                  <div className="content-editor-helptext" aria-live="polite">
                    <strong>Como escrever um bom enunciado</strong>
                    <p>
                      Reúna neste campo o contexto, o problema, o resultado esperado, os requisitos técnicos,
                      as tecnologias obrigatórias, as regras e a entrega esperada.
                    </p>
                  </div>

                  <div className="content-editor-grid content-editor-grid--two">
                    <label className="content-editor-field">
                      <span>Tecnologia do desafio</span>
                      <select
                        value={selectedContent.language}
                        onChange={(event) =>
                          updateSelectedContent({ language: event.target.value })
                        }
                      >
                        <option>Python</option>
                        <option>JavaScript</option>
                        <option>TypeScript</option>
                        <option>Docker</option>
                      </select>
                    </label>

                    <label className="content-editor-field">
                      <span>Duração estimada *</span>
                      <input
                        aria-invalid={hasPublicationError(
                          'content-duration',
                          selectedModule?.id,
                          selectedContent.id,
                        )}
                        data-validation-field="content-duration"
                        type="text"
                        value={selectedContent.estimatedDuration}
                        placeholder="Ex: 45 min"
                        onChange={(event) =>
                          updateSelectedContent({
                            estimatedDuration: event.target.value,
                          })
                        }
                      />
                    </label>
                  </div>

                  <div
                    className={`content-editor-criteria${
                      hasPublicationError(
                        'content-criteria',
                        selectedModule?.id,
                        selectedContent.id,
                      )
                        ? ' has-validation-error'
                        : ''
                    }`}
                    data-validation-field="content-criteria"
                  >
                    <div className="content-editor-criteria__header">
                      <span>Critérios de avaliação</span>
                      <strong>
                        Total:{' '}
                        {selectedContent.criteria.reduce(
                          (total, criterion) => total + Number(criterion.percentage),
                          0,
                        )}
                        %
                      </strong>
                    </div>

                    <div className="content-editor-criteria__list">
                      {selectedContent.criteria.map((criterion) => (
                        <div
                          className="content-editor-criterion"
                          key={criterion.id}
                        >
                          <input
                            type="text"
                            value={criterion.label}
                            aria-label="Nome do critério"
                            onChange={(event) =>
                              updateCriterion(criterion.id, {
                                label: event.target.value,
                              })
                            }
                          />
                          <input
                            className="content-editor-criterion__percentage"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={criterion.percentage}
                            aria-label="Porcentagem do critério"
                            onFocus={(event) => event.currentTarget.select()}
                            onChange={(event) =>
                              updateCriterion(criterion.id, {
                                percentage: clampPercentage(
                                  Number(event.target.value.replace(/\D/g, '')),
                                ),
                              })
                            }
                          />
                          <span>%</span>
                          <button
                            type="button"
                            aria-label="Remover critério"
                            onClick={() => removeCriterion(criterion.id)}
                          >
                            <X aria-hidden="true" size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      className="content-editor-add-criterion"
                      type="button"
                      onClick={addCriterion}
                    >
                      <Plus aria-hidden="true" size={14} />
                      Adicionar critério
                    </button>
                  </div>
                </>
              ) : selectedContent.type === 'ARTICLE' ? (
                <label className="content-editor-field content-editor-field--compact">
                  <span>Duração estimada *</span>
                  <input
                    aria-invalid={hasPublicationError(
                      'content-duration',
                      selectedModule?.id,
                      selectedContent.id,
                    )}
                    data-validation-field="content-duration"
                    type="text"
                    value={selectedContent.estimatedDuration}
                    placeholder="Ex: 10 min"
                    onChange={(event) =>
                      updateSelectedContent({
                        estimatedDuration: event.target.value,
                      })
                    }
                  />
                </label>
              ) : (
                <>
                  <label className="content-editor-field">
                    <span>URL do vídeo *</span>
                    <input
                      aria-invalid={hasPublicationError(
                        'content-url',
                        selectedModule?.id,
                        selectedContent.id,
                      )}
                      data-validation-field="content-url"
                      type="url"
                      value={selectedContent.contentUrl}
                      placeholder="https://youtube.com/watch?v=..."
                      onChange={(event) =>
                        updateSelectedContent({ contentUrl: event.target.value })
                      }
                    />
                  </label>

                  <div
                    className="content-editor-grid content-editor-grid--two"
                  >
                    <label className="content-editor-field">
                      <span>Duração estimada *</span>
                      <input
                        aria-invalid={hasPublicationError(
                          'content-duration',
                          selectedModule?.id,
                          selectedContent.id,
                        )}
                        data-validation-field="content-duration"
                        type="text"
                        value={selectedContent.estimatedDuration}
                        placeholder="Ex: 45 min"
                        onChange={(event) =>
                          updateSelectedContent({
                            estimatedDuration: event.target.value,
                          })
                        }
                      />
                    </label>

                    <label className="content-editor-field">
                      <span>Visibilidade</span>
                      <select
                        value={selectedContent.visibility}
                        onChange={(event) =>
                          updateSelectedContent({
                            visibility: event.target.value as Visibility,
                          })
                        }
                      >
                        {VISIBILITY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </>
              )}

              {selectedContent.type === 'ARTICLE' ? (
                <div className="content-editor-field">
                  <span>
                    Materiais complementares <small>opcional</small>
                  </span>
                  {/* TODO(backend): conectar upload, persistência e listagem dos materiais do artigo. */}
                  <button
                    className="content-editor-upload"
                    disabled
                    title="Materiais complementares serão conectados ao backend em uma próxima etapa"
                    type="button"
                  >
                    <Upload aria-hidden="true" size={22} />
                    <span>
                      <strong>Upload de materiais em breve</strong>
                      <small>PDF, slides, documentos ou código - até 20 MB</small>
                    </span>
                  </button>
                </div>
              ) : null}

              <div className="content-editor-code-hint" aria-hidden="true">
                <Code2 size={16} />
                {contentTypeLabel}
              </div>
            </form>
          ) : (
            <div className="content-editor-empty">
              Nenhum conteúdo selecionado.
            </div>
          )}
        </section>
      </section>
    </main>
  )
}
