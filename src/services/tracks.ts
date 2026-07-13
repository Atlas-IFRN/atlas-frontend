import { createApiClient } from './api'
import type {
  Trail,
  TrailAreaLabel,
  TrailLessonType,
  TrailEvaluation,
  TrailModule,
  TrailTeacher,
  TrailTheme,
  TrackLevel,
} from '../types/tracks'

interface ApiPaginatedResponse<T> {
  results?: T[]
}

export interface ApiSkill {
  id: string
  name: string
  slug?: string
}

export interface ApiContent {
  id: string
  module?: string
  title: string
  description?: string
  content_type?: TrailLessonType
  content_url?: string | null
  content?: string
  visibility?: 'enrolled' | 'draft'
  instructions?: string | null
  language?: string | null
  evaluation_criteria?: Record<string, number>
  duration_minutes?: number | null
  display_order?: number
}

export interface ApiModule {
  id: string
  track?: string
  title: string
  description?: string
  display_order?: number
  contents?: ApiContent[]
  contents_count?: number
}

interface ApiUserProgress {
  enrolled?: boolean
  completed_modules?: number
  percentage?: number
}

interface ApiEvaluation {
  score: number
  status: string
  challenge: string
  module: string
  attended: number
  pending: number
  criteria: number
  checks: Array<{
    label: string
    status: 'success' | 'danger'
  }>
}

export interface ApiTrack {
  id: string
  creator_id?: string
  title: string
  description: string
  level?: string
  level_display?: string
  duration_weeks?: number
  skills?: ApiSkill[]
  outcomes?: string[]
  prerequisites?: string[]
  modules?: ApiModule[]
  modules_count?: number
  total_duration_minutes?: number | null
  challenges_count?: number
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  user_progress?: ApiUserProgress | null
  latest_evaluation?: ApiEvaluation | null
  is_new?: boolean
  created_at?: string
}

export interface ApiUserTrack {
  id: string
  user_id: string
  track: string
  status: 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED'
  enrolled_at: string
  completed_at?: string | null
}

export interface CreateTrackPayload {
  title: string
  description: string
  level?: TrackLevel
  duration_weeks?: number
  skill_ids?: string[]
  outcomes?: string[]
  prerequisites?: string[]
}

export type UpdateTrackPayload = Partial<CreateTrackPayload> & {
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
}

export interface CreateModulePayload {
  track: string
  title: string
  description: string
  display_order: number
}

export type UpdateModulePayload = Partial<Omit<CreateModulePayload, 'track'>>

export interface CreateContentPayload {
  module: string
  title: string
  description: string
  content_type: TrailLessonType
  content_url?: string
  content?: string
  visibility?: 'enrolled' | 'draft'
  instructions?: string
  language?: string
  evaluation_criteria?: Record<string, number>
  duration_minutes?: number | null
  display_order: number
}

export type UpdateContentPayload = Partial<Omit<CreateContentPayload, 'module'>>

const tracksApi = createApiClient(
  import.meta.env.VITE_TRACKS_API_URL ?? import.meta.env.VITE_API_URL,
)

const themeLabels: Record<TrailTheme, TrailAreaLabel> = {
  backend: 'Backend',
  frontend: 'Frontend',
  ai: 'Inteligência Artificial',
  cicd: 'CI/CD',
  devops: 'DevOps',
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
}

function inferTheme(track: ApiTrack): TrailTheme {
  const skills = track.skills?.map((skill) => `${skill.name} ${skill.slug}`) ?? []
  const searchableText = normalizeText(
    [track.title, track.description, ...skills].join(' '),
  )

  if (/(ia|ai|ml|machine learning|llm|nlp|pytorch|tensorflow|scikit)/.test(searchableText)) {
    return 'ai'
  }

  if (/(frontend|front-end|react|javascript|typescript|html|css|vite)/.test(searchableText)) {
    return 'frontend'
  }

  if (/(ci\/cd|cicd|pipeline|jenkins|github actions|sonarqube|deploy)/.test(searchableText)) {
    return 'cicd'
  }

  if (/(devops|cloud|kubernetes|terraform|aws|linux|observabilidade)/.test(searchableText)) {
    return 'devops'
  }

  return 'backend'
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'PO'
}

function mapTeacher(track: ApiTrack): TrailTeacher {
  const name = 'Professor orientador'

  return {
    name,
    initials: getInitials(name),
    area: track.creator_id ? `Responsável pela trilha` : 'ATLAS',
    bio: 'Dados do professor serão exibidos pelo serviço de autenticação quando disponíveis.',
  }
}

function mapEvaluation(evaluation?: ApiEvaluation | null): TrailEvaluation | null {
  if (!evaluation) {
    return null
  }

  return {
    score: Number(evaluation.score) || 0,
    status: evaluation.status,
    challenge: evaluation.challenge,
    module: evaluation.module,
    attended: Number(evaluation.attended) || 0,
    pending: Number(evaluation.pending) || 0,
    criteria: Number(evaluation.criteria) || 0,
    checks: evaluation.checks ?? [],
  }
}

function mapModules(track: ApiTrack): TrailModule[] {
  const completedModules = track.user_progress?.completed_modules ?? 0

  return (track.modules ?? []).map((module, index) => {
    const contents = [...(module.contents ?? [])].sort(
      (current, next) => (current.display_order ?? 0) - (next.display_order ?? 0),
    )
    const lessons = contents.length || module.contents_count || 0
    const isCompleted = index < completedModules

    return {
      id: module.id,
      title: module.title,
      lessons,
      completedLessons: isCompleted ? lessons : 0,
      lessonsList: contents.map((content) => ({
        id: content.id,
        title: content.title,
        type: content.content_type ?? 'VIDEO',
        durationMinutes: content.duration_minutes ?? null,
        completed: isCompleted,
      })),
      locked: Boolean(track.user_progress?.enrolled) && index > completedModules,
    }
  })
}

function splitDescription(description: string) {
  const paragraphs = description
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return paragraphs.length > 0 ? paragraphs : [description]
}

export function mapTrackToTrail(track: ApiTrack): Trail {
  const theme = inferTheme(track)
  const totalMinutes = track.total_duration_minutes ?? 0
  const userProgress = track.user_progress
  const enrolled = Boolean(userProgress?.enrolled)
  const progress = enrolled ? Number(userProgress?.percentage ?? 0) : null
  const durationWeeks = track.duration_weeks ?? 1

  return {
    id: track.id,
    title: track.title,
    area: themeLabels[theme],
    theme,
    enrolled,
    isNew: Boolean(track.is_new),
    progress,
    modules: track.modules_count ?? track.modules?.length ?? 0,
    hours: Math.ceil(totalMinutes / 60),
    skills: track.skills?.map((skill) => skill.name) ?? [],
    description: track.description,
    durationLabel: `${durationWeeks} ${durationWeeks === 1 ? 'semana' : 'semanas'}`,
    longDescription: splitDescription(track.description),
    outcomes: track.outcomes ?? [],
    prerequisites: track.prerequisites ?? [],
    teacher: mapTeacher(track),
    evaluation: mapEvaluation(track.latest_evaluation),
    modulesList: mapModules(track),
  }
}

function unwrapPaginatedResponse<T>(data: T[] | ApiPaginatedResponse<T>) {
  if (Array.isArray(data)) {
    return data
  }

  return data.results ?? []
}

export async function getTracks(): Promise<Trail[]> {
  const { data } = await tracksApi.get<
    ApiTrack[] | ApiPaginatedResponse<ApiTrack>
  >('track/tracks/')

  return unwrapPaginatedResponse(data).map(mapTrackToTrail)
}

export async function getTrackById(trackId: string): Promise<Trail> {
  const { data } = await tracksApi.get<ApiTrack>(`track/tracks/${trackId}/`)

  return mapTrackToTrail(data)
}

export async function getTrackDraftById(trackId: string): Promise<ApiTrack> {
  const { data } = await tracksApi.get<ApiTrack>(`track/tracks/${trackId}/`)

  return data
}

export async function enrollInTrack(trackId: string): Promise<ApiUserTrack> {
  const { data } = await tracksApi.post<ApiUserTrack>('track/user-tracks/', {
    track: trackId,
  })

  return data
}

export function getTrackRequestErrorMessage(
  error: unknown,
  fallback = 'Não foi possível concluir a ação.',
) {
  if (!error || typeof error !== 'object' || !('response' in error)) {
    return error instanceof Error ? error.message : fallback
  }

  const response = error.response
  if (!response || typeof response !== 'object' || !('data' in response)) {
    return fallback
  }

  const data = response.data
  if (typeof data === 'string') {
    return data
  }

  if (!data || typeof data !== 'object') {
    return fallback
  }

  const payload = data as Record<string, unknown>

  const preferredFields = [
    'detail',
    'track',
    'user_id',
    'status',
    'non_field_errors',
  ]

  for (const field of preferredFields) {
    if (!(field in payload)) {
      continue
    }

    const value = payload[field]
    if (typeof value === 'string') {
      return value
    }
    if (Array.isArray(value)) {
      const message = value.find((item): item is string => typeof item === 'string')
      if (message) {
        return message
      }
    }
  }

  return fallback
}

export async function createTrack(
  payload: CreateTrackPayload,
): Promise<ApiTrack> {
  const { data } = await tracksApi.post<ApiTrack>('track/tracks/', payload)

  return data
}

export async function updateTrack(
  trackId: string,
  payload: UpdateTrackPayload,
): Promise<ApiTrack> {
  const { data } = await tracksApi.patch<ApiTrack>(
    `track/tracks/${trackId}/`,
    payload,
  )

  return data
}

export async function deleteTrack(trackId: string): Promise<void> {
  await tracksApi.delete(`track/tracks/${trackId}/`)
}

export async function publishTrack(trackId: string): Promise<ApiTrack> {
  const { data } = await tracksApi.post<ApiTrack>(
    `track/tracks/${trackId}/publish/`,
  )

  return data
}

export async function getSkills(): Promise<ApiSkill[]> {
  const { data } = await tracksApi.get<ApiSkill[] | ApiPaginatedResponse<ApiSkill>>(
    'track/skills/',
  )

  return unwrapPaginatedResponse(data)
}

export async function createSkill(name: string): Promise<ApiSkill> {
  const { data } = await tracksApi.post<ApiSkill>('track/skills/', {
    name,
    slug: normalizeText(name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  })

  return data
}

export async function createModule(
  payload: CreateModulePayload,
): Promise<ApiModule> {
  const { data } = await tracksApi.post<ApiModule>('track/modules/', payload)

  return data
}

export async function updateModule(
  moduleId: string,
  payload: UpdateModulePayload,
): Promise<ApiModule> {
  const { data } = await tracksApi.patch<ApiModule>(
    `track/modules/${moduleId}/`,
    payload,
  )

  return data
}

export async function deleteModule(moduleId: string): Promise<void> {
  await tracksApi.delete(`track/modules/${moduleId}/`)
}

export async function createContent(
  payload: CreateContentPayload,
): Promise<ApiContent> {
  const { data } = await tracksApi.post<ApiContent>('track/contents/', payload)

  return data
}

export async function updateContent(
  contentId: string,
  payload: UpdateContentPayload,
): Promise<ApiContent> {
  const { data } = await tracksApi.patch<ApiContent>(
    `track/contents/${contentId}/`,
    payload,
  )

  return data
}

export async function deleteContent(contentId: string): Promise<void> {
  await tracksApi.delete(`track/contents/${contentId}/`)
}
