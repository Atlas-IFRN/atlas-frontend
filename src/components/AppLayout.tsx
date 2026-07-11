import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from 'react'
import {
  BookOpen,
  Briefcase,
  Home,
  User,
  Users,
} from 'lucide-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { UserChip } from './molecules/UserChip'
import { TopBar } from './molecules/TopBar'
import logoIcon from '../assets/brand/atlas-logo.svg'
import logoFull from '../assets/brand/atlas-logo-full.svg'

interface NavItem {
  to: string
  label: string
  Icon: ComponentType<{
    className?: string
    size?: number
    strokeWidth?: number
  }>
  activePrefix?: string
}

function getRoleLabel(role: string | undefined) {
  const normalizedRole = role?.trim().toLowerCase()

  if (normalizedRole === 'student' || normalizedRole === 'aluno') {
    return 'Estudante'
  }

  if (normalizedRole === 'teacher' || normalizedRole === 'professor') {
    return 'Professor'
  }

  return role || 'Demo'
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const previousPathname = useRef(location.pathname)
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const userName = user?.firstName || 'Atlas'
  const userRole = getRoleLabel(user?.role)
  const menu = useMemo<NavItem[]>(
    () => [
      { to: '/inicio', label: 'Início', Icon: Home },
      { to: '/trilhas', label: 'Trilhas', Icon: BookOpen },
      { to: '/bolsas', label: 'Bolsas P&D', Icon: Briefcase },
      {
        to: '/banco-talentos',
        label: 'Banco de Talentos',
        Icon: Users,
        activePrefix: '/banco-talentos',
      },
      { to: '/perfil', label: 'Meu Perfil', Icon: User },
    ],
    [],
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)')
    const handleChange = () => {
      setIsMobile(mediaQuery.matches)

      if (!mediaQuery.matches) {
        setMobileOpen(false)
      }
    }

    handleChange()
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileOpen(false)
      }
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  useEffect(() => {
    if (previousPathname.current === location.pathname) {
      return
    }

    previousPathname.current = location.pathname

    if (!mobileOpen) {
      return
    }

    const frame = window.requestAnimationFrame(() => setMobileOpen(false))

    return () => window.cancelAnimationFrame(frame)
  }, [location.pathname, mobileOpen])

  function close() {
    setMobileOpen(false)
  }

  function toggleSidebar() {
    if (isMobile) {
      setMobileOpen((isOpen) => !isOpen)
      return
    }

    setCollapsed((isCollapsed) => !isCollapsed)
  }

  function handleUserChipClick() {
    logout()
    setMobileOpen(false)
    navigate('/entrar', { replace: true })
  }

  function matchesPath(path: string) {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  function isActive(item: NavItem) {
    return (
      matchesPath(item.to) ||
      (item.activePrefix ? matchesPath(item.activePrefix) : false)
    )
  }

  function renderNavItems(items: NavItem[]) {
    return items.map((item) => {
      const { to, label, Icon } = item
      const active = isActive(item)

      return (
        <li key={to}>
          <Link
            to={to}
            data-label={label}
            className={`nav-item${active ? ' active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className="nav-icon" size={20} strokeWidth={2} />
            <span>{label}</span>
          </Link>
        </li>
      )
    })
  }

  const appClassName = `app${collapsed && !isMobile ? ' collapsed' : ''}${
    isMobile ? ' is-mobile' : ''
  }${mobileOpen ? ' drawer-open' : ''}`
  const toggleLabel = isMobile
    ? mobileOpen
      ? 'Fechar menu'
      : 'Abrir menu'
    : collapsed
      ? 'Expandir menu'
      : 'Recolher menu'

  return (
    <div className="shell-pad">
      <div className={appClassName}>
        {isMobile && mobileOpen && (
          <div className="app-backdrop" onClick={close} />
        )}

        <aside
          className="sidebar"
          role={isMobile ? 'dialog' : undefined}
          aria-modal={isMobile || undefined}
        >
          <div className="sidebar-brand">
            <img src={logoFull} alt="Atlas" className="brand-logo-full" />
            <img src={logoIcon} alt="Atlas" className="brand-logo-icon" />
          </div>

          <div className="nav-section">
            <div className="nav-label">Menu</div>
            <ul className="nav-list">{renderNavItems(menu)}</ul>
          </div>

          <div className="sidebar-foot">
            <button
              type="button"
              className="sidebar-user"
              aria-label="Sair e ir para login"
              onClick={handleUserChipClick}
            >
              <UserChip
                name={userName}
                role={userRole}
                color="blue"
                size="sm"
              />
            </button>
          </div>
        </aside>

        <main className="content">
          <TopBar
            user={{
              name: userName,
              role: userRole,
              color: 'blue',
            }}
            sidebarToggleLabel={toggleLabel}
            sidebarExpanded={isMobile ? mobileOpen : !collapsed}
            onToggleSidebar={toggleSidebar}
            onOpenNotifications={() => undefined}
          />

          <div className="content-scroll">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
