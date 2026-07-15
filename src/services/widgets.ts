import { api, createApiClient } from './api'
import type { ActiveScholarship, FeedTrackProgress } from '../types/feed'

/**
 * Integração dos widgets da sidebar (feed + perfil):
 * - "Minhas trilhas": trilhas do usuário ordenadas por progresso (top 3).
 * - "Bolsas ativas": bolsas abertas/em seleção (global).
 * Os endpoints vivem no track-service e no scholarship-service; aqui mapeamos
 * a resposta para os tipos que os componentes já consomem.
 */

const tracksApi = createApiClient(
  import.meta.env.VITE_TRACKS_API_URL ?? import.meta.env.VITE_API_URL,
)

// ─── Minhas trilhas ──────────────────────────────────────────────────────────

interface ApiTopTrack {
  track_id: string
  track_title: string
  status: string
  completed_modules: number
  total_modules: number
  progress_pct: number
}

function toFeedTrackProgress(hit: ApiTopTrack): FeedTrackProgress {
  return {
    id: hit.track_id,
    label: hit.track_title,
    href: `/trilhas/${hit.track_id}`,
    modules: hit.total_modules,
    completedModules: hit.completed_modules,
    progressPercent: Math.min(100, Math.max(0, Number(hit.progress_pct) || 0)),
    currentModuleProgress: 0,
  }
}

/**
 * Top-N trilhas do usuário por progresso. Sem `userUuid`, usa o usuário logado
 * (feed). Com `userUuid`, as trilhas daquele perfil (perfil de terceiros).
 */
export async function getTopTracks(userUuid?: string, limit = 3): Promise<FeedTrackProgress[]> {
  const params: Record<string, string | number> = { limit }
  if (userUuid) {
    params.user_uuid = userUuid
  }
  const { data } = await tracksApi.get<ApiTopTrack[]>('track/user-tracks/top/', { params })
  return (data ?? []).map(toFeedTrackProgress)
}

// ─── Bolsas ativas ───────────────────────────────────────────────────────────

interface ApiActiveScholarship {
  id: string
  title: string
  status: string
  technologies: string[]
  registration_end: string | null
  result_date: string | null
}

const DAY_MONTH_FORMAT = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
})

/** "07 mai" (sem o "de" e sem o ponto do mês abreviado). */
function formatDayMonth(iso: string): string {
  const parts = DAY_MONTH_FORMAT.formatToParts(new Date(iso))
  const day = parts.find((part) => part.type === 'day')?.value ?? ''
  const month = (parts.find((part) => part.type === 'month')?.value ?? '').replace('.', '')
  return `${day} ${month}`.trim()
}

/** Dias inteiros de hoje até a data (negativo = já passou). */
function daysUntil(iso: string): number {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  return Math.round((startOfDay(new Date(iso)) - startOfDay(new Date())) / 86_400_000)
}

/**
 * Deriva a fase (cor do ícone) e o texto de status do card a partir do status
 * da bolsa + datas das fases Registration/Result:
 *  - Open + inscrição aberta → "Inscrições até 07 mai · faltam 2 dias" (verde)
 *  - resultado no futuro      → "Em andamento · resultado em 12 mai" (âmbar)
 *  - resultado no passado     → "Resultado publicado em 20 mai" (azul)
 */
function toActiveScholarship(hit: ApiActiveScholarship): ActiveScholarship {
  const title = hit.technologies?.[0] ? `${hit.title} · ${hit.technologies[0]}` : hit.title
  const base = { id: hit.id, title, href: `/bolsas/${hit.id}` }

  if (hit.status === 'Open' && hit.registration_end) {
    const days = daysUntil(hit.registration_end)
    const date = formatDayMonth(hit.registration_end)
    let status: string
    if (days > 1) {
      status = `Inscrições até ${date} · faltam ${days} dias`
    } else if (days === 1) {
      status = `Inscrições até ${date} · falta 1 dia`
    } else if (days === 0) {
      status = `Inscrições até ${date} · último dia`
    } else {
      status = 'Inscrições encerradas'
    }
    return { ...base, phase: 'inscricao', status }
  }

  if (hit.result_date) {
    const resultInFuture = new Date(hit.result_date).getTime() > Date.now()
    return resultInFuture
      ? { ...base, phase: 'andamento', status: `Em andamento · resultado em ${formatDayMonth(hit.result_date)}` }
      : { ...base, phase: 'resultados', status: `Resultado publicado em ${formatDayMonth(hit.result_date)}` }
  }

  return { ...base, phase: 'andamento', status: 'Em andamento' }
}

interface ApiPaginated<T> {
  count: number
  results: T[]
}

/** Bolsas ativas (global) para o widget, no máximo `limit`. */
export async function getActiveScholarships(limit = 3): Promise<ActiveScholarship[]> {
  const { data } = await api.get<ApiPaginated<ApiActiveScholarship>>('scholarship/scholarships/active/', {
    params: { page_size: limit },
  })
  return (data.results ?? []).map(toActiveScholarship)
}
