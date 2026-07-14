import type { AvatarColor } from '../components/atoms/Avatar'

export type FeedFilter = 'principal' | 'mais-curtidos' | 'docentes' | 'sistema'

export interface FeedAuthor {
  id: string
  /** Matrícula do autor — usada na rota de perfil (/perfil/{matricula}). */
  matricula?: string
  name: string
  /** Papel/curso exibido abaixo do nome, ex.: "Backend · 3º período". */
  role: string
  avatarColor?: AvatarColor
  avatarSrc?: string
  /** Selo opcional exibido ao lado do nome, ex.: "Professor". */
  badge?: string
}

export interface PostComment {
  id: string
  author: FeedAuthor
  content: string
  time: string
  likes: number
  liked?: boolean
  /** Respostas encadeadas (estilo Twitter/LinkedIn), um nível. */
  replies?: PostComment[]
}

/** Preview de link compartilhado (post do tipo "link"). */
export interface PostLinkPreview {
  url: string
  domain: string
  title: string
  description?: string
  /** Tom do bloco de imagem placeholder quando não há thumbnail. */
  tone?: PostMediaTone
}

/** Card de conteúdo interno (trilha, módulo, desafio). */
export interface PostEmbed {
  eyebrow: string
  title: string
  meta: string
  tone?: 'primary' | 'success' | 'warning' | 'purple'
}

export type PostMediaTone = 'blue' | 'purple' | 'teal' | 'amber' | 'pink'

export interface PostMedia {
  /** URL da imagem. Quando ausente, renderiza um placeholder por `tone`. */
  src?: string
  alt: string
  tone?: PostMediaTone
  caption?: string
}

export type PostVariant =
  | 'text'
  | 'long-text'
  | 'image'
  | 'image-long'
  | 'link'
  | 'embed'

export interface FeedPost {
  id: string
  author: FeedAuthor
  time: string
  /** Texto do post. Suporta #hashtags, @menções e `código`. */
  content: string
  variant: PostVariant
  media?: PostMedia
  linkPreview?: PostLinkPreview
  embed?: PostEmbed
  likes: number
  liked?: boolean
  shares?: number
  /** Post fixado por um docente (aparece no topo do feed "principal"). */
  isFixed?: boolean
  /** Total de comentários (contador do backend, antes de carregar a thread). */
  commentsCount?: number
  comments: PostComment[]
}

export type SystemPostTone = 'primary' | 'ifrn'

export interface SystemPost {
  id: string
  tone: SystemPostTone
  label: string
  /** Mensagem em HTML simples (com <strong>) já sanitizada no mock. */
  message: string
  actionLabel?: string
  actionHref?: string
  time: string
}

export type FeedHeroTheme = 'blue' | 'green'

export interface FeedHeroSlide {
  id: string
  /** Tema de cor do slide (fundo do hero). */
  theme?: FeedHeroTheme
  eyebrow: string
  title: string
  titleAccent: string
  description: string
  actions: Array<{
    label: string
    href: string
    variant: 'primary' | 'soft'
  }>
}

export type BannerType = 'COMUNICADO_IFRN' | 'SISTEMA'

/** Banner dinâmico do carrossel do feed, gerenciado por docentes. */
export interface Banner {
  id: string
  type: BannerType
  title: string
  subtitle: string
  primaryButtonText: string
  primaryButtonLink: string
  secondaryButtonText: string
  secondaryButtonLink: string
  isActive: boolean
  order: number
}

export interface FeedTrackProgress {
  id: string
  label: string
  /** Rota da trilha (cada item é um link). */
  href: string
  /** Total de módulos da trilha (nº de segmentos da barra). */
  modules: number
  /** Módulos totalmente concluídos (segmentos cheios). */
  completedModules: number
  /**
   * Progresso (0-100) do módulo em andamento — proporção de conteúdos
   * concluídos. Preenche parcialmente o segmento do módulo atual.
   */
  currentModuleProgress: number
}

/**
 * Fase da bolsa — define a cor do ícone no card:
 * - `inscricao`: inscrições abertas (verde)
 * - `andamento`: em progresso (âmbar)
 * - `resultados`: resultado publicado (azul)
 */
export type ScholarshipPhase = 'inscricao' | 'andamento' | 'resultados'

export interface ActiveScholarship {
  id: string
  title: string
  /** Rota da bolsa (cada item é um link). */
  href: string
  phase: ScholarshipPhase
  /** Texto de status já pronto, coerente com a fase da bolsa. */
  status: string
}
