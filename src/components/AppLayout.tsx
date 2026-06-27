import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'

export function AppLayout() {
  const [collapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = 'dark'
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

  return (
    <div className="shell-pad">
      {mobileOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className={collapsed ? 'app collapsed' : 'app'}>
        <aside
          className={mobileOpen ? 'sidebar mobile-open' : 'sidebar'}
          aria-label="Menu lateral"
        >
          <div className="sidebar-footer-slot" aria-hidden="true" />
        </aside>

        <main className="content">
          <header className="topbar" />

          <div className="content-scroll">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
