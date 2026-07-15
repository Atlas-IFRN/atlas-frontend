import type { FeedHeroSlide } from '../../types/feed'

interface FeedWelcomeSlideOptions {
  activeTracks?: number
  firstName: string
  isError?: boolean
  isLoading?: boolean
  isTeacher: boolean
  openScholarships?: number
  today?: Date
}

const FEED_DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  weekday: 'long',
  year: 'numeric',
})

function studentDescription({
  activeTracks = 0,
  isError,
  isLoading,
  openScholarships = 0,
}: Pick<
  FeedWelcomeSlideOptions,
  'activeTracks' | 'isError' | 'isLoading' | 'openScholarships'
>) {
  if (isLoading) {
    return 'Estamos preparando um resumo das suas trilhas e das bolsas abertas.'
  }

  if (isError) {
    return 'Acompanhe suas trilhas em andamento e confira as bolsas abertas para continuar avançando.'
  }

  const trackLabel = activeTracks === 1 ? 'trilha' : 'trilhas'
  const scholarshipLabel =
    openScholarships === 1 ? 'bolsa aberta' : 'bolsas abertas'

  return `Você tem ${activeTracks} ${trackLabel} em andamento e ${openScholarships} ${scholarshipLabel} para explorar.`
}

export function createFeedWelcomeSlide({
  activeTracks,
  firstName,
  isError = false,
  isLoading = false,
  isTeacher,
  openScholarships,
  today = new Date(),
}: FeedWelcomeSlideOptions): FeedHeroSlide {
  const displayName = firstName.trim() || 'usuário ATLAS'

  if (isTeacher) {
    return {
      id: 'welcome-teacher',
      eyebrow: FEED_DATE_FORMATTER.format(today),
      title: `Olá, ${displayName}.`,
      titleAccent: 'Sua orientação faz a diferença.',
      description:
        'Acompanhe o desenvolvimento dos alunos, compartilhe orientações e mantenha trilhas e bolsas atualizadas.',
      actions: [
        { label: 'Gerenciar trilhas', href: '/trilhas', variant: 'primary' },
        { label: 'Gerenciar bolsas', href: '/bolsas', variant: 'soft' },
      ],
    }
  }

  return {
    id: 'welcome-student',
    eyebrow: FEED_DATE_FORMATTER.format(today),
    title: `Olá, ${displayName}.`,
    titleAccent: 'Sua jornada continua hoje.',
    description: studentDescription({
      activeTracks,
      isError,
      isLoading,
      openScholarships,
    }),
    actions: [
      {
        label: activeTracks ? 'Continuar trilha' : 'Explorar trilhas',
        href: '/trilhas',
        variant: 'primary',
      },
      { label: 'Ver bolsas abertas', href: '/bolsas', variant: 'soft' },
    ],
  }
}
