import { Navigate, useLocation } from 'react-router-dom'
import { Icon } from '../../components/ui/Icon'
import { useAuth } from '../../contexts/AuthContext'
import { RoutePage } from '../RoutePage'

interface LocationState {
  from?: { pathname?: string }
}

export default function LoginPage() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const state = location.state as LocationState | null

  if (isAuthenticated) {
    return <Navigate to={state?.from?.pathname ?? '/feed'} replace />
  }

  return (
    <RoutePage title="Entrar">
      <p>
        <Icon name="Home" aria-label="Inicio" />
      </p>
    </RoutePage>
  )
}
