import type { FeedTrackProgress } from '../../types/feed'

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
