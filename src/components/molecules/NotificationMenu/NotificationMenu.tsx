import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  BriefcaseBusiness,
  GraduationCap,
  Heart,
  Info,
  MessageSquareText,
} from 'lucide-react'
import { Button } from '../../atoms/Button'
import { IconTile, type IconTileVariant } from '../../atoms/IconTile'
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
} from '../../../hooks/useNotifications'
import type {
  Notification,
  NotificationType,
} from '../../../services/notifications'
import './NotificationMenu.css'

// 'POSTS' agrupa as notificações do feed (curtidas + comentários/respostas).
type NotificationFilter = 'ALL' | 'UNREAD' | 'POSTS' | NotificationType

// Tipos que caem sob a aba "Postagens".
const POST_TYPES: NotificationType[] = ['feed_like', 'feed_comment']

interface NotificationMenuProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

const FILTERS: Array<{ value: NotificationFilter; label: string }> = [
  { value: 'ALL', label: 'Todas' },
  { value: 'UNREAD', label: 'Não lidas' },
  { value: 'POSTS', label: 'Postagens' },
  { value: 'system', label: 'Sistema' },
]

const TYPE_PRESENTATION = {
  feed_like: { icon: Heart, variant: 'primary', label: 'Curtida' },
  feed_comment: { icon: MessageSquareText, variant: 'primary', label: 'Comentário' },
  track: { icon: GraduationCap, variant: 'success', label: 'Trilha' },
  scholarship: { icon: BriefcaseBusiness, variant: 'primary', label: 'Bolsa' },
  system: { icon: Info, variant: 'neutral', label: 'Sistema' },
} satisfies Record<
  NotificationType,
  { icon: typeof Bell; variant: IconTileVariant; label: string }
>

// Fallback para qualquer `type` fora do mapa (ex.: tipo novo que o backend
// passe a emitir antes do front conhecer) — evita quebrar a renderização.
const FALLBACK_PRESENTATION = {
  icon: Bell,
  variant: 'neutral' as IconTileVariant,
  label: 'Notificação',
}

function getPresentation(type: NotificationType) {
  return TYPE_PRESENTATION[type] ?? FALLBACK_PRESENTATION
}

const relativeTimeFormatter = new Intl.RelativeTimeFormat('pt-BR', {
  numeric: 'auto',
})
const EMPTY_NOTIFICATIONS: Notification[] = []

function formatRelativeTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const elapsedSeconds = Math.round((date.getTime() - Date.now()) / 1000)
  const absoluteSeconds = Math.abs(elapsedSeconds)

  if (absoluteSeconds < 60) {
    return 'agora'
  }

  if (absoluteSeconds < 3_600) {
    return relativeTimeFormatter.format(
      Math.round(elapsedSeconds / 60),
      'minute',
    )
  }

  if (absoluteSeconds < 86_400) {
    return relativeTimeFormatter.format(
      Math.round(elapsedSeconds / 3_600),
      'hour',
    )
  }

  return relativeTimeFormatter.format(
    Math.round(elapsedSeconds / 86_400),
    'day',
  )
}

function NotificationItem({
  notification,
  onActivate,
}: {
  notification: Notification
  onActivate: (notification: Notification) => void
}) {
  const presentation = getPresentation(notification.type)
  const relativeTime = formatRelativeTime(notification.created_at)
  const hasLink = Boolean(notification.link)
  // Notificação lida perde a cor do ícone (fica neutra); só as não lidas
  // destacam com a cor do tipo.
  const tileVariant = notification.is_read ? 'neutral' : presentation.variant

  return (
    <li
      className="notification-menu__item"
      data-unread={!notification.is_read || undefined}
    >
      <button
        type="button"
        onClick={() => onActivate(notification)}
        aria-label={`${notification.title}.${
          hasLink ? ' Abrir.' : ''
        } ${notification.is_read ? 'Notificação lida' : 'Marcar como lida'}`}
      >
        <span className="notification-menu__unread-dot" aria-hidden="true" />
        <IconTile
          aria-hidden="true"
          icon={presentation.icon}
          size="md"
          variant={tileVariant}
        />

        <span className="notification-menu__item-content">
          <strong>{notification.title}</strong>
          {notification.message ? <span>{notification.message}</span> : null}
          <small>
            {presentation.label}
            {relativeTime ? <span aria-hidden="true"> · </span> : null}
            <time dateTime={notification.created_at}>{relativeTime}</time>
          </small>
        </span>
      </button>
    </li>
  )
}

export function NotificationMenu({
  isOpen,
  onOpenChange,
}: NotificationMenuProps) {
  const navigate = useNavigate()
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [filter, setFilter] = useState<NotificationFilter>('ALL')
  const notificationsQuery = useNotifications()
  const markAsRead = useMarkNotificationAsRead()
  const markAllAsRead = useMarkAllNotificationsAsRead()
  const notifications = notificationsQuery.data ?? EMPTY_NOTIFICATIONS
  const unreadCount = notifications.filter((item) => !item.is_read).length

  // Clicar numa notificação: marca como lida (se não lida) e, havendo `link`,
  // navega para o item relacionado e fecha o menu.
  function handleActivate(notification: Notification) {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id)
    }
    if (notification.link) {
      onOpenChange(false)
      navigate(notification.link)
    }
  }

  const filteredNotifications = useMemo(() => {
    if (filter === 'UNREAD') {
      return notifications.filter((item) => !item.is_read)
    }

    if (filter === 'POSTS') {
      return notifications.filter((item) => POST_TYPES.includes(item.type))
    }

    if (filter !== 'ALL') {
      return notifications.filter((item) => item.type === filter)
    }

    return notifications
  }, [filter, notifications])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onOpenChange(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onOpenChange])

  return (
    <div className="notification-menu-root" ref={rootRef}>
      <span className="topbar-notification-button">
        <Button
          ref={buttonRef}
          variant="ghost"
          iconLeft={Bell}
          aria-label="Notificações"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-controls="topbar-notification-menu"
          onClick={() => onOpenChange(!isOpen)}
        />
        {unreadCount > 0 ? (
          <span className="topbar-notification-dot" aria-hidden="true" />
        ) : null}
      </span>

      {isOpen ? (
        <section
          id="topbar-notification-menu"
          className="notification-menu"
          role="dialog"
          aria-label="Notificações"
        >
          <header className="notification-menu__header">
            <div>
              <h2>Notificações</h2>
              {unreadCount > 0 ? (
                <span aria-label={`${unreadCount} não lidas`}>
                  {unreadCount}
                </span>
              ) : null}
            </div>
            <button
              type="button"
              disabled={unreadCount === 0 || markAllAsRead.isPending}
              onClick={() => markAllAsRead.mutate()}
            >
              {markAllAsRead.isPending ? 'Marcando...' : 'Marcar todas'}
            </button>
          </header>

          <div
            className="notification-menu__tabs"
            role="tablist"
            aria-label="Filtrar notificações"
          >
            {FILTERS.map((item) => {
              const count =
                item.value === 'UNREAD'
                  ? unreadCount
                  : item.value === 'ALL'
                    ? notifications.length
                    : notifications.filter(
                        (notification) => notification.type === item.value,
                      ).length

              return (
                <button
                  key={item.value}
                  type="button"
                  role="tab"
                  aria-selected={filter === item.value}
                  onClick={() => setFilter(item.value)}
                >
                  {item.label}
                  {(item.value === 'ALL' || item.value === 'UNREAD') &&
                  count > 0 ? (
                    <span>{count}</span>
                  ) : null}
                </button>
              )
            })}
          </div>

          <div className="notification-menu__body">
            {notificationsQuery.isLoading ? (
              <div className="notification-menu__status" aria-live="polite">
                <span
                  className="notification-menu__spinner"
                  aria-hidden="true"
                />
                Carregando notificações...
              </div>
            ) : notificationsQuery.isError ? (
              <div className="notification-menu__status" role="alert">
                <strong>Não foi possível carregar.</strong>
                <button
                  type="button"
                  onClick={() => notificationsQuery.refetch()}
                >
                  Tentar novamente
                </button>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <ul>
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onActivate={handleActivate}
                  />
                ))}
              </ul>
            ) : (
              <div className="notification-menu__status">
                <IconTile aria-hidden="true" icon={Bell} variant="neutral" />
                <strong>Nenhuma notificação por aqui.</strong>
                <span>Você está em dia.</span>
              </div>
            )}
          </div>

          <footer className="notification-menu__footer">
            Notificações dos últimos 5 dias
          </footer>
        </section>
      ) : null}
    </div>
  )
}
