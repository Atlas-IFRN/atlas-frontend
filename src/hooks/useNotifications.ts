import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type Notification,
} from '../services/notifications'

export const notificationsQueryKey = ['notifications'] as const

export function useNotifications() {
  return useQuery({
    queryKey: notificationsQueryKey,
    queryFn: getNotifications,
    refetchInterval: 60_000,
  })
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: notificationsQueryKey })
      const previous = queryClient.getQueryData<Notification[]>(
        notificationsQueryKey,
      )

      queryClient.setQueryData<Notification[]>(notificationsQueryKey, (items) =>
        items?.map((item) =>
          item.id === notificationId ? { ...item, is_read: true } : item,
        ),
      )

      return { previous }
    },
    onError: (_error, _notificationId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notificationsQueryKey, context.previous)
      }
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey }),
  })
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationsQueryKey })
      const previous = queryClient.getQueryData<Notification[]>(
        notificationsQueryKey,
      )

      queryClient.setQueryData<Notification[]>(notificationsQueryKey, (items) =>
        items?.map((item) => ({ ...item, is_read: true })),
      )

      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notificationsQueryKey, context.previous)
      }
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey }),
  })
}
