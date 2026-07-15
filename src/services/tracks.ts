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
  SkillCategory,
} from '../types/tracks'

interface ApiPaginatedResponse<T> {
  results?: T[]
}

export interface ApiSkill {
  id: string
  name: string
  slug?: string
  category?: SkillCategory
  category_display?: string
}

export interface ApiTrackCategory {
  id: string
  name: string
  slug: string
  is_active?: boolean
  display_order?: number
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
  enrollment_id?: string | null
  status?: 'IN_PROGRESS' | 'COMPLETED' | null
  completed_modules?: number
  completed_content_ids?: string[]
  percentage?: number
}

export interface CompleteContentResult {
  content_id: string
  content_completed: boolean
  module_completed: boolean
  track_completed: boolean
  percentage: number
  next_content: {
    id: string
    module_id: string
    title: string
  } | null
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
  category?: ApiTrackCategory
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

export type ChallengeSubmissionStatus =
  | 'PENDING_AI'
  | 'EVALUATING'
  | 'EVALUATED'
  | 'FAILED'

export interface ApiChallengeCriterion {
  id?: string
  label?: string
  name?: string
  kind?: 'profile' | 'criterion'
  weight?: number
  present?: boolean
  passed?: boolean
  evidence?: string
}

export interface ApiChallengeSubmission {
  id: string
  user_track: string
  challenge: string
  github_url: string
  ai_status: ChallengeSubmissionStatus
  ai_feedback?: string | null
  ai_score?: number | string | null
  ai_criteries?: ApiChallengeCriterion[]
  submitted_at: string
  evaluated_at?: string | null
}

export interface CreateChallengeSubmissionPayload {
  user_track: string
  challenge: string
  github_url: string
}

interface ApiCompletedTrack {
  track_id: string
  track_title: string
  completed_at?: string | null
}

export interface CompletedTrack {
  trackId: string
  title: string
  completedAt: string | null
}

export interface CreateTrackPayload {
  title: string
  description: string
  category_id: string
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

function getTrackTheme(track: ApiTrack): TrailTheme {
  const categorySlug = track.category?.slug
  return categorySlug && categorySlug in themeLabels
    ? (categorySlug as TrailTheme)
    : 'backend'
}

const trackLevelLabels: Record<TrackLevel, string> = {
  BEGINNER: 'Iniciante',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
}

function getTrackLevel(track: ApiTrack): TrackLevel {
  if (
    track.level === 'BEGINNER' ||
    track.level === 'INTERMEDIATE' ||
    track.level === 'ADVANCED'
  ) {
    return track.level
  }

  return 'BEGINNER'
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
  const completedContentIds = new Set(
    track.user_progress?.completed_content_ids ?? [],
  )

  return (track.modules ?? []).map((module, index) => {
    const contents = [...(module.contents ?? [])].sort(
      (current, next) => (current.display_order ?? 0) - (next.display_order ?? 0),
    )
    const lessons = contents.length || module.contents_count || 0
    const completedLessons = contents.filter((content) =>
      completedContentIds.has(content.id),
    ).length
    const locked =
      Boolean(track.user_progress?.enrolled) && index > completedModules

    return {
      id: module.id,
      title: module.title,
      lessons,
      completedLessons,
      lessonsList: contents.map((content) => ({
        id: content.id,
        title: content.title,
        type: content.content_type ?? 'VIDEO',
        durationMinutes: content.duration_minutes ?? null,
        completed: completedContentIds.has(content.id),
      })),
      locked,
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
  const theme = getTrackTheme(track)
  const level = getTrackLevel(track)
  const totalMinutes = track.total_duration_minutes ?? 0
  const userProgress = track.user_progress
  const enrolled = Boolean(userProgress?.enrolled)
  const progress = enrolled ? Number(userProgress?.percentage ?? 0) : null
  const enrollmentStatus = enrolled
    ? (userProgress?.status ??
      (progress !== null && progress >= 100 ? 'COMPLETED' : 'IN_PROGRESS'))
    : null
  const durationWeeks = track.duration_weeks ?? 1

  return {
    id: track.id,
    title: track.title,
    area: track.category?.name ?? themeLabels[theme],
    theme,
    level,
    levelLabel: track.level_display ?? trackLevelLabels[level],
    enrolled,
    enrollmentId: userProgress?.enrollment_id ?? null,
    enrollmentStatus,
    isNew: Boolean(track.is_new),
    progress,
    modules: track.modules_count ?? track.modules?.length ?? 0,
    hours: Math.ceil(totalMinutes / 60),
    skills:
      track.skills?.map((skill) => ({
        id: skill.id,
        name: skill.name,
        slug: skill.slug ?? '',
        category: skill.category ?? 'TOOL',
      })) ?? [],
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

export async function getTrackApiById(trackId: string): Promise<ApiTrack> {
  const { data } = await tracksApi.get<ApiTrack>(`track/tracks/${trackId}/`)

  return data
}

export async function getTrackDraftById(trackId: string): Promise<ApiTrack> {
  return getTrackApiById(trackId)
}

export async function getModuleById(moduleId: string): Promise<ApiModule> {
  const { data } = await tracksApi.get<ApiModule>(`track/modules/${moduleId}/`)

  return data
}

export async function getContentById(contentId: string): Promise<ApiContent> {
  const { data } = await tracksApi.get<ApiContent>(
    `track/contents/${contentId}/`,
  )

  return data
}

export async function getMyTrackEnrollment(
  trackId: string,
): Promise<ApiUserTrack | null> {
  const { data } = await tracksApi.get<
    ApiUserTrack[] | ApiPaginatedResponse<ApiUserTrack>
  >('track/user-tracks/')
  const enrollments = unwrapPaginatedResponse(data)

  return (
    enrollments.find(
      (enrollment) =>
        String(enrollment.track) === trackId &&
        enrollment.status === 'IN_PROGRESS',
    ) ??
    enrollments.find(
      (enrollment) =>
        String(enrollment.track) === trackId &&
        enrollment.status === 'COMPLETED',
    ) ??
    null
  )
}

export async function getChallengeSubmissions(
  challengeId: string,
): Promise<ApiChallengeSubmission[]> {
  const { data } = await tracksApi.get<
    ApiChallengeSubmission[] | ApiPaginatedResponse<ApiChallengeSubmission>
  >('track/submissions/')

  return unwrapPaginatedResponse(data)
    .filter((submission) => String(submission.challenge) === challengeId)
    .sort(
      (current, next) =>
        new Date(next.submitted_at).getTime() -
        new Date(current.submitted_at).getTime(),
    )
}

export async function createChallengeSubmission(
  payload: CreateChallengeSubmissionPayload,
): Promise<ApiChallengeSubmission> {
  const { data } = await tracksApi.post<ApiChallengeSubmission>(
    'track/submissions/',
    payload,
  )

  return data
}

export async function completeContent(
  contentId: string,
): Promise<CompleteContentResult> {
  const { data } = await tracksApi.post<CompleteContentResult>(
    `track/contents/${contentId}/complete/`,
  )

  return data
}

export async function uncompleteContent(
  contentId: string,
): Promise<CompleteContentResult> {
  const { data } = await tracksApi.post<CompleteContentResult>(
    `track/contents/${contentId}/uncomplete/`,
  )

  return data
}

export async function enrollInTrack(trackId: string): Promise<ApiUserTrack> {
  const { data } = await tracksApi.post<ApiUserTrack>('track/user-tracks/', {
    track: trackId,
  })

  return data
}

interface DropTrackEnrollmentParams {
  trackId: string
  enrollmentId?: string | null
}

export async function dropTrackEnrollment({
  trackId,
  enrollmentId,
}: DropTrackEnrollmentParams): Promise<ApiUserTrack> {
  const enrollment = enrollmentId ? null : await getMyTrackEnrollment(trackId)
  const activeEnrollmentId = enrollmentId ?? enrollment?.id

  if (!activeEnrollmentId) {
    throw new Error(
      'Não foi encontrada uma matrícula em andamento nesta trilha.',
    )
  }

  const { data } = await tracksApi.post<ApiUserTrack>(
    `track/user-tracks/${activeEnrollmentId}/drop/`,
  )

  return data
}

export async function getCompletedTracks(
  userId: string,
): Promise<CompletedTrack[]> {
  const { data } = await tracksApi.get<ApiCompletedTrack[]>(
    'track/user-tracks/completed/',
    { params: { user_uuid: userId } },
  )

  return data.map((completedTrack) => ({
    trackId: completedTrack.track_id,
    title: completedTrack.track_title,
    completedAt: completedTrack.completed_at ?? null,
  }))
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
    'github_url',
    'challenge',
    'user_track',
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

export async function getTrackCategories(): Promise<ApiTrackCategory[]> {
  const { data } = await tracksApi.get<
    ApiTrackCategory[] | ApiPaginatedResponse<ApiTrackCategory>
  >('track/categories/')

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
