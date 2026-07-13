import { createApiClient } from './api'

export type NotificationType =
  | 'feed_like'
  | 'feed_comment'
  | 'track'
  | 'scholarship'
  | 'system'

export interface Notification {
  id: string
  title: string
  message: string
  is_read: boolean
  type: NotificationType
  /** Rota relativa do front para abrir o item relacionado (ex.: /inicio/post/<id>). */
  link?: string
  created_at: string
}

interface NotificationsPaginatedResponse<T> {
  results?: T[]
}

// Cliente dedicado ao notification-service. Sem VITE_NOTIFICATIONS_API_URL cai
// para VITE_API_URL (=/api), e o prefixo /api/notifications é roteado pelo
// gateway (prod) / proxy do Vite (dev).
const notificationsApi = createApiClient(
  import.meta.env.VITE_NOTIFICATIONS_API_URL ?? import.meta.env.VITE_API_URL,
)

function unwrapNotifications(
  data: Notification[] | NotificationsPaginatedResponse<Notification>,
) {
  if (Array.isArray(data)) {
    return data
  }
  return data.results ?? []
}

export async function getNotifications() {
  const { data } = await notificationsApi.get<
    Notification[] | NotificationsPaginatedResponse<Notification>
  >('notifications/notifications/')
  return unwrapNotifications(data)
}

export async function markNotificationAsRead(notificationId: string) {
  const { data } = await notificationsApi.patch<Notification>(
    `notifications/notifications/${notificationId}/read/`,
  )
  return data
}

export async function markAllNotificationsAsRead() {
  const { data } = await notificationsApi.post<{ updated: number }>(
    'notifications/notifications/mark-all-read/',
  )
  return data
}
