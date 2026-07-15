import api from './api'

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE'
export type AuditServiceId =
  | 'auth'
  | 'track'
  | 'scholarship'
  | 'feed'
  | 'notifications'

export interface AuditPayload {
  before?: Record<string, unknown> | null
  after?: Record<string, unknown> | null
  relation?: string
  operation?: string
  related_ids?: string[]
  [key: string]: unknown
}

interface AuditLogApi {
  id: string
  table_name: string
  action: AuditAction
  record_id: string
  user_id: string | null
  payload: AuditPayload | null
  created_at: string
}

interface AuditActorApi {
  id: string
  registration_number?: string | null
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface AuditLog extends AuditLogApi {
  service: AuditServiceId
  actorRegistrationNumber: string | null
}

export interface AuditPageResult {
  logs: AuditLog[]
  nextServices: AuditServiceId[]
  failedServices: AuditServiceId[]
}

export const AUDIT_SERVICES: ReadonlyArray<{
  id: AuditServiceId
  label: string
  endpoint: string
}> = [
  { id: 'auth', label: 'Autenticação', endpoint: 'auth/audit-logs/' },
  { id: 'track', label: 'Trilhas', endpoint: 'track/audit-logs/' },
  {
    id: 'scholarship',
    label: 'Bolsas',
    endpoint: 'scholarship/audit-logs/',
  },
  { id: 'feed', label: 'Feed', endpoint: 'feed/audit-logs/' },
  {
    id: 'notifications',
    label: 'Notificações',
    endpoint: 'notifications/audit-logs/',
  },
]

const serviceById = new Map(AUDIT_SERVICES.map((service) => [service.id, service]))
const actorRegistrationCache = new Map<string, string | null>()

async function getActorRegistrations(logs: AuditLogApi[]) {
  const actorIds = [
    ...new Set(
      logs
        .map(({ user_id }) => user_id)
        .filter((userId): userId is string => Boolean(userId)),
    ),
  ]

  if (actorIds.length === 0) {
    return new Map<string, string>()
  }

  const missingActorIds = actorIds.filter(
    (actorId) => !actorRegistrationCache.has(actorId),
  )

  if (missingActorIds.length > 0) {
    try {
      const { data } = await api.post<AuditActorApi[]>(
        'auth/users/audit-identities/',
        { ids: missingActorIds },
      )
      missingActorIds.forEach((actorId) =>
        actorRegistrationCache.set(actorId, null),
      )
      data.forEach((actor) => {
        actorRegistrationCache.set(
          actor.id,
          actor.registration_number?.trim() || null,
        )
      })
    } catch {
      // Mantém a timeline disponível e tenta resolver novamente na próxima página.
    }
  }

  return new Map(
    actorIds.flatMap((actorId) => {
      const registration = actorRegistrationCache.get(actorId)
      return registration ? [[actorId, registration] as const] : []
    }),
  )
}

export async function getAuditLogsPage(
  page = 1,
  services: AuditServiceId[] = AUDIT_SERVICES.map(({ id }) => id),
): Promise<AuditPageResult> {
  const responses = await Promise.allSettled(
    services.map(async (serviceId) => {
      const service = serviceById.get(serviceId)
      if (!service) {
        throw new Error(`Serviço de auditoria desconhecido: ${serviceId}`)
      }

      const { data } = await api.get<PaginatedResponse<AuditLogApi>>(
        service.endpoint,
        { params: { page, page_size: 100 } },
      )

      return {
        serviceId,
        hasNext: Boolean(data.next),
        logs: data.results,
      }
    }),
  )

  const rawLogs: Array<AuditLogApi & { service: AuditServiceId }> = []
  const nextServices: AuditServiceId[] = []
  const failedServices: AuditServiceId[] = []

  responses.forEach((response, index) => {
    const serviceId = services[index]
    if (response.status === 'rejected') {
      failedServices.push(serviceId)
      return
    }
    rawLogs.push(
      ...response.value.logs.map((log) => ({ ...log, service: serviceId })),
    )
    if (response.value.hasNext) {
      nextServices.push(serviceId)
    }
  })

  rawLogs.sort(
    (left, right) =>
      new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
  )

  const actorRegistrations = await getActorRegistrations(rawLogs)
  const logs: AuditLog[] = rawLogs.map((log) => ({
    ...log,
    actorRegistrationNumber: log.user_id
      ? (actorRegistrations.get(log.user_id) ?? null)
      : null,
  }))

  return { logs, nextServices, failedServices }
}
