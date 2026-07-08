export type TrailFilter = 'all' | 'enrolled' | 'new'

export type TrailTheme = 'backend' | 'frontend' | 'ai' | 'cicd' | 'devops'

export type TrailAreaLabel =
  | 'Backend'
  | 'Frontend'
  | 'Inteligência Artificial'
  | 'CI/CD'
  | 'DevOps'

export interface TrailsStats {
  activeTrails: number
  certificates: number
  scholarships: number
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
}
