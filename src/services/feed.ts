import { createApiClient } from './api'
import type { AvatarColor } from '../components/atoms/Avatar'
import type {
  FeedAuthor,
  FeedPost,
  PostComment,
  PostEmbed,
  PostLinkPreview,
  PostMedia,
  PostVariant,
} from '../types/feed'

/**
 * Camada de integração com o feed-service.
 *
 * O backend já devolve o autor pronto (nome/foto/papel) embutido em cada post e
 * comentário — resolvido no auth-service e cacheado no Redis do próprio feed.
 * Aqui só mapeamos esse `author` para o formato de UI (avatar por cor/foto).
 */

const feedApi = createApiClient(
  import.meta.env.VITE_FEED_API_URL ?? import.meta.env.VITE_API_URL,
)

// ---------------------------------------------------------------------------
// Tipos crus da API
// ---------------------------------------------------------------------------

export type AuthorRole = 'STUDENT' | 'TEACHER' | 'SYSTEM'

/** Filtro do feed exposto na UI → mapeado para o parâmetro do backend. */
export type FeedFilterValue =
  | 'principal'
  | 'mais-curtidos'
  | 'docentes'
  | 'sistema'

/** Autor já resolvido pelo backend (nome/foto/rótulo prontos para exibir). */
interface ApiAuthor {
  id: string
  matricula: string | null
  name: string
  image: string | null
  role: string
  badge: string | null
}

interface ApiMediaMeta {
  src?: string
  alt?: string
  tone?: PostMedia['tone']
  caption?: string
}

interface ApiEmbedLink {
  // Link externo
  url?: string
  domain?: string
  title?: string
  description?: string
  tone?: string
  // Embed de conteúdo interno (trilha/módulo/desafio)
  eyebrow?: string
  meta?: string
}

export interface ApiPost {
  id: string
  author_id: string
  author_role: AuthorRole
  author: ApiAuthor
  content: string
  image: string | null
  media: ApiMediaMeta | null
  embed_link: ApiEmbedLink | null
  is_fixed: boolean
  likes_count: number
  comments_count: number
  liked: boolean
  created_at: string
  updated_at: string
}

export interface ApiComment {
  id: string
  post: string
  parent: string | null
  author_id: string
  author: ApiAuthor
  content: string
  likes_count: number
  liked: boolean
  replies?: ApiComment[]
  created_at: string
  updated_at: string
}

interface ApiPaginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface CreatePostInput {
  content: string
  image?: File | null
  media?: ApiMediaMeta | null
  embedLink?: ApiEmbedLink | null
}

// ---------------------------------------------------------------------------
// Autor → UI
// ---------------------------------------------------------------------------

const AVATAR_COLORS: AvatarColor[] = ['blue', 'teal', 'purple', 'amber', 'pink']

function avatarColorFor(id: string): AvatarColor {
  let hash = 0
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function mapAuthor(author: ApiAuthor): FeedAuthor {
  return {
    id: author.id,
    matricula: author.matricula || undefined,
    name: author.name || 'Membro do ATLAS',
    role: author.role,
    badge: author.badge || undefined,
    avatarColor: avatarColorFor(author.id),
    avatarSrc: author.image || undefined,
  }
}

// ---------------------------------------------------------------------------
// Tempo relativo (pt-BR)
// ---------------------------------------------------------------------------

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) {
    return ''
  }
  const seconds = Math.floor((Date.now() - then) / 1000)

  if (seconds < 60) {
    return 'agora'
  }
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `há ${minutes}min`
  }
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `há ${hours}h`
  }
  const days = Math.floor(hours / 24)
  if (days === 1) {
    return 'ontem'
  }
  if (days < 7) {
    return `há ${days} dias`
  }
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

// ---------------------------------------------------------------------------
// Mapeadores API → UI
// ---------------------------------------------------------------------------

function mapLinkPreview(embed: ApiEmbedLink): PostLinkPreview | undefined {
  if (!embed.url) {
    return undefined
  }
  const tone = (['blue', 'purple', 'teal', 'amber', 'pink'] as const).find(
    (value) => value === embed.tone,
  )
  let domain = embed.domain
  if (!domain) {
    try {
      domain = new URL(embed.url).hostname.replace(/^www\./, '')
    } catch {
      domain = embed.url
    }
  }
  return {
    url: embed.url,
    domain,
    title: embed.title || domain,
    description: embed.description,
    tone,
  }
}

function mapEmbed(embed: ApiEmbedLink): PostEmbed | undefined {
  if (embed.url || !embed.title) {
    return undefined
  }
  const tone = (['primary', 'success', 'warning', 'purple'] as const).find(
    (value) => value === embed.tone,
  )
  return {
    eyebrow: embed.eyebrow || 'Conteúdo',
    title: embed.title,
    meta: embed.meta || '',
    tone,
  }
}

function mapMedia(post: ApiPost): PostMedia | undefined {
  const src = post.image || post.media?.src
  const meta = post.media
  if (!src && !meta) {
    return undefined
  }
  return {
    src: src || undefined,
    alt: meta?.alt || 'Imagem da publicação',
    tone: meta?.tone,
    caption: meta?.caption,
  }
}

function inferVariant(
  content: string,
  media?: PostMedia,
  linkPreview?: PostLinkPreview,
  embed?: PostEmbed,
): PostVariant {
  const isLong = content.length > 280
  if (media) {
    return isLong ? 'image-long' : 'image'
  }
  if (linkPreview) {
    return 'link'
  }
  if (embed) {
    return 'embed'
  }
  return isLong ? 'long-text' : 'text'
}

export function mapComment(comment: ApiComment): PostComment {
  return {
    id: comment.id,
    author: mapAuthor(comment.author),
    content: comment.content,
    time: relativeTime(comment.created_at),
    likes: comment.likes_count,
    liked: comment.liked,
    replies: (comment.replies ?? []).map(mapComment),
  }
}

export function mapPost(post: ApiPost): FeedPost {
  const media = mapMedia(post)
  const linkPreview = post.embed_link ? mapLinkPreview(post.embed_link) : undefined
  const embed = post.embed_link ? mapEmbed(post.embed_link) : undefined

  return {
    id: post.id,
    author: mapAuthor(post.author),
    time: relativeTime(post.created_at),
    content: post.content,
    variant: inferVariant(post.content, media, linkPreview, embed),
    media,
    linkPreview,
    embed,
    likes: post.likes_count,
    liked: post.liked,
    isFixed: post.is_fixed,
    commentsCount: post.comments_count,
    comments: [],
  }
}

// ---------------------------------------------------------------------------
// Chamadas de API
// ---------------------------------------------------------------------------

const FILTER_TO_PARAMS: Record<
  FeedFilterValue,
  { author_role?: AuthorRole; sort?: 'likes' }
> = {
  // "principal": fixados no topo + recentes (ordenação padrão do backend).
  principal: {},
  'mais-curtidos': { sort: 'likes' },
  docentes: { author_role: 'TEACHER' },
  sistema: { author_role: 'SYSTEM' },
}

export interface FeedPage {
  posts: FeedPost[]
  nextPage: number | null
  count: number
}

export async function getFeedPage(
  filter: FeedFilterValue,
  page = 1,
): Promise<FeedPage> {
  const params: Record<string, string | number> = {
    page,
    ...FILTER_TO_PARAMS[filter],
  }

  const { data } = await feedApi.get<ApiPaginated<ApiPost>>('feed/posts/', {
    params,
  })

  return {
    posts: data.results.map(mapPost),
    nextPage: data.next ? page + 1 : null,
    count: data.count,
  }
}

export async function getPost(postId: string): Promise<FeedPost> {
  const { data } = await feedApi.get<ApiPost>(`feed/posts/${postId}/`)
  return mapPost(data)
}

export async function createPost(input: CreatePostInput): Promise<FeedPost> {
  let data: ApiPost

  if (input.image) {
    const form = new FormData()
    form.append('content', input.content)
    form.append('image', input.image)
    if (input.media) {
      form.append('media', JSON.stringify(input.media))
    }
    if (input.embedLink) {
      form.append('embed_link', JSON.stringify(input.embedLink))
    }
    ;({ data } = await feedApi.post<ApiPost>('feed/posts/', form))
  } else {
    ;({ data } = await feedApi.post<ApiPost>('feed/posts/', {
      content: input.content,
      media: input.media ?? undefined,
      embed_link: input.embedLink ?? undefined,
    }))
  }

  return mapPost(data)
}

export async function updatePost(
  postId: string,
  patch: { content?: string; embedLink?: ApiEmbedLink | null },
): Promise<FeedPost> {
  const { data } = await feedApi.patch<ApiPost>(`feed/posts/${postId}/`, {
    content: patch.content,
    embed_link: patch.embedLink,
  })
  return mapPost(data)
}

export async function deletePost(postId: string): Promise<void> {
  await feedApi.delete(`feed/posts/${postId}/`)
}

export async function setPostLike(
  postId: string,
  liked: boolean,
): Promise<ApiPost> {
  const { data } = await feedApi.request<ApiPost>({
    method: liked ? 'post' : 'delete',
    url: `feed/posts/${postId}/like/`,
  })
  return data
}

/** Fixa (fixed=true) ou desafixa um post. Só docentes têm permissão (backend). */
export async function setPostFixed(
  postId: string,
  fixed: boolean,
): Promise<ApiPost> {
  const { data } = await feedApi.request<ApiPost>({
    method: fixed ? 'post' : 'delete',
    url: `feed/posts/${postId}/fix/`,
  })
  return data
}

export async function getPostComments(
  postId: string,
): Promise<PostComment[]> {
  const { data } = await feedApi.get<ApiPaginated<ApiComment>>(
    `feed/posts/${postId}/comments/`,
    { params: { page_size: 50 } },
  )
  return data.results.map(mapComment)
}

export async function createComment(
  postId: string,
  content: string,
  parentId?: string,
): Promise<void> {
  await feedApi.post(`feed/posts/${postId}/comments/`, {
    content,
    parent: parentId,
  })
}

export async function setCommentLike(
  commentId: string,
  liked: boolean,
): Promise<void> {
  await feedApi.request({
    method: liked ? 'post' : 'delete',
    url: `feed/comments/${commentId}/like/`,
  })
}

export function getFeedRequestErrorMessage(
  error: unknown,
  fallback = 'Não foi possível concluir a ação.',
): string {
  if (!error || typeof error !== 'object' || !('response' in error)) {
    return error instanceof Error ? error.message : fallback
  }
  const response = (error as { response?: { data?: unknown } }).response
  const data = response?.data
  if (typeof data === 'string') {
    return data
  }
  if (data && typeof data === 'object') {
    for (const value of Object.values(data as Record<string, unknown>)) {
      if (typeof value === 'string') {
        return value
      }
      if (Array.isArray(value) && typeof value[0] === 'string') {
        return value[0]
      }
    }
  }
  return fallback
}
