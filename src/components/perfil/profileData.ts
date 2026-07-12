import type { LucideIcon } from 'lucide-react'
import { BookOpen, Briefcase, Code2, Trophy } from 'lucide-react'
import type { FeedTrackProgress } from '../../types/feed'

export interface ProfileStat {
  label: string
  value: number
  actionLabel: string
  actionHref: string
  actionAriaLabel: string
  tone: 'primary' | 'teal' | 'purple' | 'amber'
  icon: LucideIcon
}

export const PROFILE_STATS: ProfileStat[] = [
  {
    label: 'Trilhas ativas',
    value: 2,
    actionLabel: 'Ver trilhas em andamento',
    actionHref: '/trilhas?filtro=em-andamento',
    actionAriaLabel: 'Ver trilhas em andamento',
    tone: 'primary',
    icon: BookOpen,
  },
  {
    label: 'Trilhas concluídas',
    value: 4,
    actionLabel: 'Ver trilhas concluídas',
    actionHref: '/trilhas?filtro=concluidas',
    actionAriaLabel: 'Ver trilhas concluídas',
    tone: 'teal',
    icon: Trophy,
  },
  {
    label: 'Bolsas',
    value: 2,
    actionLabel: 'Minhas candidaturas',
    actionHref: '/bolsas?filtro=minhas-candidaturas',
    actionAriaLabel: 'Ver minhas candidaturas a bolsas',
    tone: 'amber',
    icon: Briefcase,
  },
  {
    label: 'Notas recebidas',
    value: 7,
    actionLabel: 'Ver feedbacks',
    actionHref: '/notas',
    actionAriaLabel: 'Ver feedbacks recebidos',
    tone: 'purple',
    icon: Code2,
  },
]

export const PROFILE_TRACKS: FeedTrackProgress[] = [
  {
    id: 'backend',
    label: 'Desenvolvimento Backend',
    href: '/trilhas/backend',
    modules: 5,
    completedModules: 3,
    currentModuleProgress: 10,
  },
  {
    id: 'frontend',
    label: 'Desenvolvimento Frontend',
    href: '/trilhas/frontend',
    modules: 5,
    completedModules: 1,
    currentModuleProgress: 90,
  },
]
