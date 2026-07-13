import type { LucideIcon } from 'lucide-react'
import { BookOpen, Briefcase, MessageSquareText, Trophy } from 'lucide-react'
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

export interface ProfileAchievement {
  id: string
  label: string
  href: string
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
    icon: MessageSquareText,
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

export const PROFILE_ACHIEVEMENTS: ProfileAchievement[] = [
  {
    id: 'python-fundamentals',
    label: 'Fundamentos de Python',
    href: '/trilhas/python-fundamentals',
  },
  {
    id: 'git-github',
    label: 'Git e GitHub',
    href: '/trilhas/git-github',
  },
  {
    id: 'web-fundamentals',
    label: 'Fundamentos da Web',
    href: '/trilhas/web-fundamentals',
  },
  {
    id: 'logic',
    label: 'Lógica de Programação',
    href: '/trilhas/logic',
  },
]
