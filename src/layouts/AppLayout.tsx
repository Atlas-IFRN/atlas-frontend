import { Outlet } from 'react-router-dom'

export function AppLayout() {
  return (
    <div className="app-layout">
      {/* A sidebar compartilhada será adicionada aqui. */}
      <Outlet />
    </div>
  )
}
