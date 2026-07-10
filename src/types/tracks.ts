export type TrailFilter = 'all' | 'enrolled' | 'new'

export type TrailTheme = 'backend' | 'frontend' | 'ai' | 'cicd' | 'devops'

export type TrailLessonType =
  | 'VIDEO'
  | 'ARTICLE'
  | 'REPOSITORY'
  | 'QUIZ'
  | 'CHALLENGE'

export type TrackLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export type TrailAreaLabel =
  | 'Backend'
  | 'Frontend'
  | 'Inteligência Artificial'
  | 'CI/CD'
  | 'DevOps'

export interface TrailLesson {
  id: string
  title: string
  type: TrailLessonType
  durationMinutes: number | null
  completed: boolean
}

export interface TrailModule {
  id: string
  title: string
  lessons: number
  completedLessons: number
  lessonsList: TrailLesson[]
  locked: boolean
}

export interface TrailTeacher {
  name: string
  initials: string
  area: string
  bio: string
}

export interface TrailEvaluation {
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

export interface Trail {
  id: string
  title: string
  area: TrailAreaLabel
  theme: TrailTheme
  enrolled: boolean
  isNew: boolean
  progress: number | null
  modules: number
  hours: number
  skills: string[]
  description: string
  durationLabel: string
  longDescription: string[]
  outcomes: string[]
  prerequisites: string[]
  teacher: TrailTeacher
  evaluation: TrailEvaluation | null
  modulesList: TrailModule[]
}
