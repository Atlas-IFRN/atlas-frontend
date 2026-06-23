import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface RoleRouteProps {
  allowedRoles: string[]
  redirectTo?: string
}

export function RoleRoute({
  allowedRoles,
  redirectTo = '/feed',
}: RoleRouteProps) {
  const { user } = useAuth()
  const role = user?.role.trim().toLowerCase()
  const canAccess = role !== undefined && allowedRoles.includes(role)

  return canAccess ? <Outlet /> : <Navigate to={redirectTo} replace />
}
