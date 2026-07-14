import { useEffect, useRef, useState } from 'react'
import {
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  CircleHelp,
  FlaskConical,
  LogOut,
  Menu,
  UserRound,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '../../atoms/Button'
import { SearchInput } from '../../atoms/SearchInput'
import { Avatar, type AvatarColor } from '../../atoms/Avatar'
import { UserChip } from '../UserChip'
import { NotificationMenu } from '../NotificationMenu'
import './TopBar.css'

const DEFAULT_SEARCH_PLACEHOLDER = 'Buscar trilhas, bolsas, pessoas...'
const OPEN_SCHOLARSHIPS_COUNT = 4

export interface TopBarProps {
  user: {
    name: string
    role?: string
    src?: string
    color?: AvatarColor
    registration?: string
  }
  sidebarToggleLabel?: string
  sidebarExpanded?: boolean
  searchPlaceholder?: string
  onToggleSidebar: () => void
  onLogout: () => void
  /**
   * Quando definido, exibe no menu do perfil um switch de DEBUG para alternar o
   * papel do usuário entre professor e estudante. Só é passado em builds de debug.
   */
  debugRole?: {
    isTeacher: boolean
    pending: boolean
    onToggle: (next: boolean) => void
  }
}

export function TopBar({
  user,
  sidebarToggleLabel = 'Alternar menu',
  sidebarExpanded = false,
  searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER,
  onToggleSidebar,
  onLogout,
  debugRole,
}: TopBarProps) {
  const location = useLocation()
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const profileButtonRef = useRef<HTMLButtonElement>(null)
  const [profileMenuPath, setProfileMenuPath] = useState<string | null>(null)
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false)
  const isProfileMenuOpen = profileMenuPath === location.pathname

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return
    }

    function handlePointerDown(event: PointerEvent) {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuPath(null)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setProfileMenuPath(null)
        profileButtonRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isProfileMenuOpen])

  function closeProfileMenu() {
    setProfileMenuPath(null)
  }

  function handleLogout() {
    closeProfileMenu()
    onLogout()
  }

  const profilePath = user.registration
    ? `/perfil/${encodeURIComponent(user.registration)}`
    : '/perfil'

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

      <SearchInput
        aria-label="Buscar"
        className="topbar-search"
        placeholder={searchPlaceholder}
      />

      <div className="topbar-right">
        <NotificationMenu
          isOpen={isNotificationMenuOpen}
          onOpenChange={(isOpen) => {
            setIsNotificationMenuOpen(isOpen)
            if (isOpen) {
              setProfileMenuPath(null)
            }
          }}
        />

        <div className="topbar-profile" ref={profileMenuRef}>
          <button
            ref={profileButtonRef}
            type="button"
            className="topbar-user-button"
            aria-label={`${isProfileMenuOpen ? 'Fechar' : 'Abrir'} menu do perfil de ${user.name}`}
            aria-expanded={isProfileMenuOpen}
            aria-haspopup="dialog"
            aria-controls="topbar-profile-menu"
            onClick={() => {
              setIsNotificationMenuOpen(false)
              setProfileMenuPath(isProfileMenuOpen ? null : location.pathname)
            }}
          >
            {userChip}
            <ChevronDown
              className="topbar-user-chevron"
              aria-hidden="true"
            />
          </button>

          {isProfileMenuOpen ? (
            <section
              id="topbar-profile-menu"
              className="profile-menu"
              role="dialog"
              aria-label={`Menu do perfil de ${user.name}`}
            >
              <div className="profile-menu__identity">
                <Avatar
                  className="profile-menu__avatar"
                  name={user.name}
                  src={user.src}
                  color={user.color ?? 'blue'}
                  size="md"
                />

                <div className="profile-menu__identity-text">
                  <strong>{user.name}</strong>
                  <span>
                    {user.role}
                    {user.registration ? (
                      <>
                        <span aria-hidden="true"> · </span>
                        {user.registration}
                      </>
                    ) : null}
                  </span>
                </div>
              </div>

              {debugRole ? (
                <div className="profile-menu__debug">
                  <label className="debug-switch">
                    <span className="debug-switch__label">
                      <FlaskConical aria-hidden="true" />
                      <span className="debug-switch__text">
                        Modo professor
                        <small>Demo — define seu papel como docente</small>
                      </span>
                    </span>
                    <input
                      className="debug-switch__input"
                      type="checkbox"
                      role="switch"
                      checked={debugRole.isTeacher}
                      disabled={debugRole.pending}
                      onChange={(event) =>
                        debugRole.onToggle(event.target.checked)
                      }
                    />
                    <span className="debug-switch__slider" aria-hidden="true" />
                  </label>
                </div>
              ) : null}

              <nav
                className="profile-menu__navigation"
                aria-label="Atalhos do perfil"
              >
                <Link to={profilePath} onClick={closeProfileMenu}>
                  <UserRound aria-hidden="true" />
                  <span>Minha conta</span>
                </Link>
                <Link to="/trilhas" onClick={closeProfileMenu}>
                  <BookOpen aria-hidden="true" />
                  <span>Minhas trilhas</span>
                </Link>
                <Link to="/bolsas" onClick={closeProfileMenu}>
                  <BriefcaseBusiness aria-hidden="true" />
                  <span>Bolsas abertas</span>
                  <span
                    className="profile-menu__badge"
                    aria-label={`${OPEN_SCHOLARSHIPS_COUNT} bolsas abertas`}
                  >
                    {OPEN_SCHOLARSHIPS_COUNT}
                  </span>
                </Link>
                <a
                  href="https://nadic.ifrn.edu.br/#contato"
                  target="_blank"
                  rel="noreferrer"
                  onClick={closeProfileMenu}
                >
                  <CircleHelp aria-hidden="true" />
                  <span>Ajuda &amp; Suporte</span>
                </a>
              </nav>

              <div className="profile-menu__footer">
                <button type="button" onClick={handleLogout}>
                  <LogOut aria-hidden="true" />
                  <span>Sair da conta</span>
                </button>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </header>
  )
}
