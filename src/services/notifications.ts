import api from './api'

export type NotificationType = 'SCHOLARSHIP' | 'EVALUATION' | 'SYSTEM'

export interface Notification {
  id: string
  title: string
  message: string
  is_read: boolean
  type: NotificationType
  created_at: string
}

export async function getNotifications() {
  const { data } = await api.get<Notification[]>('auth/notifications/')
  return data
}

export async function markNotificationAsRead(notificationId: string) {
  const { data } = await api.patch<Notification>(
    `auth/notifications/${notificationId}/read/`,
  )
  return data
}

export async function markAllNotificationsAsRead() {
  const { data } = await api.post<{ updated: number }>(
    'auth/notifications/mark-all-read/',
  )
  return data
}
