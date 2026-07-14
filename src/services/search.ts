import { api, createApiClient } from './api'

/**
 * Camada de integração da busca global do cabeçalho. Um endpoint compacto por
 * serviço (trilhas, bolsas, perfis); o frontend consulta os três em paralelo e
 * compõe as seções. Todos respondem no formato paginado do DRF
 * (`{ count, results }`) e aceitam `?search=<q>&page_size=<n>`.
 */

// Trilhas podem ter uma base própria (VITE_TRACKS_API_URL); bolsas e perfis
// usam o client padrão (/api). Mesmo padrão de services/tracks.ts.
const tracksApi = createApiClient(
  import.meta.env.VITE_TRACKS_API_URL ?? import.meta.env.VITE_API_URL,
)

export interface SearchResponse<T> {
  count: number
  results: T[]
}

export interface TrackHit {
  id: string
  title: string
  level: string
  levelDisplay: string
  skills: string[]
}

export interface ScholarshipHit {
  id: string
  title: string
  status: string
  technologies: string[]
}

export interface ProfileHit {
  matricula: string
  fullName: string
  image: string | null
  roleLabel: string
  institutionName: string | null
}

interface ApiPaginated<T> {
  count: number
  results: T[]
}

interface ApiTrackHit {
  id: string
  title: string
  level: string
  level_display: string
  skills: string[]
}

interface ApiScholarshipHit {
  id: string
  title: string
  status: string
  technologies: string[]
}

interface ApiProfileHit {
  registration_number: string
  full_name: string
  image: string | null
  role_label: string
  institution_name: string | null
}

function mapTrackHit(hit: ApiTrackHit): TrackHit {
  return {
    id: hit.id,
    title: hit.title,
    level: hit.level,
    levelDisplay: hit.level_display,
    skills: hit.skills ?? [],
  }
}

function mapScholarshipHit(hit: ApiScholarshipHit): ScholarshipHit {
  return {
    id: hit.id,
    title: hit.title,
    status: hit.status,
    technologies: hit.technologies ?? [],
  }
}

function mapProfileHit(hit: ApiProfileHit): ProfileHit {
  return {
    matricula: hit.registration_number,
    fullName: hit.full_name,
    image: hit.image || null,
    roleLabel: hit.role_label,
    institutionName: hit.institution_name ?? null,
  }
}

export async function searchTracks(query: string, limit = 4): Promise<SearchResponse<TrackHit>> {
  const { data } = await tracksApi.get<ApiPaginated<ApiTrackHit>>('track/tracks/search/', {
    params: { search: query, page_size: limit },
  })
  return { count: data.count, results: (data.results ?? []).map(mapTrackHit) }
}

export async function searchScholarships(
  query: string,
  limit = 4,
): Promise<SearchResponse<ScholarshipHit>> {
  const { data } = await api.get<ApiPaginated<ApiScholarshipHit>>('scholarship/scholarships/search/', {
    params: { search: query, page_size: limit },
  })
  return { count: data.count, results: (data.results ?? []).map(mapScholarshipHit) }
}

export async function searchProfiles(
  query: string,
  limit = 4,
): Promise<SearchResponse<ProfileHit>> {
  const { data } = await api.get<ApiPaginated<ApiProfileHit>>('auth/users/search/', {
    params: { search: query, page_size: limit },
  })
  return { count: data.count, results: (data.results ?? []).map(mapProfileHit) }
}

// ---------------------------------------------------------------------------
// Mapeamento hit -> linha de resultado (compartilhado pelo dropdown e pela
// página /busca), com o destino de navegação de cada tipo.
// ---------------------------------------------------------------------------

export interface SearchRow {
  key: string
  to: string
  primary: string
  secondary?: string
  /** Presente só em resultados de perfil: avatar exibido à esquerda. */
  avatar?: { name: string; src?: string }
}

const SCHOLARSHIP_STATUS_LABELS: Record<string, string> = {
  Draft: 'Rascunho',
  Open: 'Inscrições abertas',
  RegistrationClosed: 'Inscrições encerradas',
  Closed: 'Encerrada',
}

export function trackToRow(hit: TrackHit): SearchRow {
  const parts = [hit.levelDisplay, ...hit.skills].filter(Boolean)
  return {
    key: hit.id,
    to: `/trilhas/${hit.id}`,
    primary: hit.title,
    secondary: parts.join(' · ') || undefined,
  }
}

export function scholarshipToRow(hit: ScholarshipHit): SearchRow {
  const parts = [SCHOLARSHIP_STATUS_LABELS[hit.status] ?? hit.status, ...hit.technologies]
    .filter(Boolean)
  return {
    key: hit.id,
    to: `/bolsas/${hit.id}`,
    primary: hit.title,
    secondary: parts.join(' · ') || undefined,
  }
}

export function profileToRow(hit: ProfileHit): SearchRow {
  const parts = [hit.roleLabel, hit.institutionName].filter(Boolean)
  const name = hit.fullName || hit.matricula
  return {
    key: hit.matricula,
    to: `/perfil/${encodeURIComponent(hit.matricula)}`,
    primary: name,
    secondary: parts.join(' · ') || undefined,
    avatar: { name, src: hit.image ?? undefined },
  }
}
