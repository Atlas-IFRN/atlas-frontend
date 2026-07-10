import { createApiClient } from './api'
import type {
  Trail,
  TrailAreaLabel,
  TrailLessonType,
  TrailEvaluation,
  TrailModule,
  TrailTeacher,
  TrailTheme,
} from '../types/tracks'

interface ApiPaginatedResponse<T> {
  results?: T[]
}

interface ApiSkill {
  id: string
  name: string
  slug: string
}

interface ApiContent {
  id: string
  title: string
  content_type?: TrailLessonType
  duration_minutes?: number | null
  display_order?: number
}

interface ApiModule {
  id: string
  title: string
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

interface ApiTrack {
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
  user_progress?: ApiUserProgress | null
  latest_evaluation?: ApiEvaluation | null
  is_new?: boolean
  created_at?: string
}

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

function unwrapTracksResponse(data: ApiTrack[] | ApiPaginatedResponse<ApiTrack>) {
  if (Array.isArray(data)) {
    return data
  }

  return data.results ?? []
}

export async function getTracks(): Promise<Trail[]> {
  const { data } = await tracksApi.get<
    ApiTrack[] | ApiPaginatedResponse<ApiTrack>
  >('tracks/')

  return unwrapTracksResponse(data).map(mapTrackToTrail)
}

export async function getTrackById(trackId: string): Promise<Trail> {
  const { data } = await tracksApi.get<ApiTrack>(`tracks/${trackId}/`)

  return mapTrackToTrail(data)
}
