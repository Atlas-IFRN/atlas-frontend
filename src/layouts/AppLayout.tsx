import { Outlet } from 'react-router-dom'
import { ResponsiveShell } from '../components/templates/ResponsiveShell'

export function AppLayout() {
  return (
    <ResponsiveShell>
      {/* A sidebar compartilhada sera adicionada aqui. */}
      <Outlet />
    </ResponsiveShell>
  )
}
