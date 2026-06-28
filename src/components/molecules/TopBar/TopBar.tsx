import { Bell, Menu, Search } from 'lucide-react'
import { Button } from '../../atoms/Button'
import type { AvatarColor } from '../../atoms/Avatar'
import { UserChip } from '../UserChip'
import './TopBar.css'

const DEFAULT_SEARCH_PLACEHOLDER = 'Buscar trilhas, bolsas, pessoas...'

export interface TopBarProps {
  user: {
    name: string
    role?: string
    src?: string
    color?: AvatarColor
  }
  sidebarToggleLabel?: string
  sidebarExpanded?: boolean
  hasUnreadNotifications?: boolean
  searchPlaceholder?: string
  onToggleSidebar: () => void
  onOpenNotifications: () => void
  onOpenUserMenu?: () => void
}

export function TopBar({
  user,
  sidebarToggleLabel = 'Alternar menu',
  sidebarExpanded = false,
  hasUnreadNotifications = false,
  searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER,
  onToggleSidebar,
  onOpenNotifications,
  onOpenUserMenu,
}: TopBarProps) {
  const userChip = (
    <UserChip
      name={user.name}
      role={user.role}
      src={user.src}
      color={user.color ?? 'blue'}
      size="sm"
    />
  )

  return (
    <header className="topbar">
      <Button
        variant="ghost"
        iconLeft={Menu}
        aria-label={sidebarToggleLabel}
        aria-expanded={sidebarExpanded}
        onClick={onToggleSidebar}
      />

      <label className="topbar-search">
        <Search className="topbar-search__icon" aria-hidden="true" />
        <input
          className="topbar-search__input"
          type="search"
          aria-label="Buscar"
          placeholder={searchPlaceholder}
        />
      </label>

      <div className="topbar-right">
        <span className="topbar-notification-button">
          <Button
            variant="ghost"
            iconLeft={Bell}
            aria-label="Notificações"
            onClick={onOpenNotifications}
          />
          {hasUnreadNotifications ? (
            <span className="topbar-notification-dot" aria-hidden="true" />
          ) : null}
        </span>

        {onOpenUserMenu ? (
          <button
            type="button"
            className="topbar-user-button"
            aria-label={`Abrir perfil de ${user.name}`}
            onClick={onOpenUserMenu}
          >
            {userChip}
          </button>
        ) : (
          <div className="topbar-user-button">{userChip}</div>
        )}
      </div>
    </header>
  )
}
