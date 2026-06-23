import { Outlet } from 'react-router-dom'
import { ResponsiveShell } from '../components/templates/ResponsiveShell'
import { Icon } from '../components/ui/Icon'

export function AppLayout() {
  return (
    <ResponsiveShell>
      <div className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
        <Icon name="Home" className="text-[var(--primary)]"/>
        <span>Atlas</span>
      </div>
      <Outlet />
    </ResponsiveShell>
  )
}
