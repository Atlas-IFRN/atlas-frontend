import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AuthContext,
  type AuthUser,
  type LoginData,
} from '../contexts/AuthContext'
import { setApiAuthHandlers } from '../services/api'

const authBypassEnabled =
  import.meta.env.DEV && import.meta.env.VITE_AUTH_BYPASS === 'true'
const authBypassRole = import.meta.env.VITE_AUTH_BYPASS_ROLE?.trim() || 'teacher'
const authBypassUser: AuthUser = {
  id: 'dev-auth-bypass-user',
  matricula: '000000',
  firstName: 'Dev',
  fullName: 'Dev Auth Bypass',
  email: 'dev.auth.bypass@atlas.local',
  role: authBypassRole,
  ira: 10,
  period: 1,
  aboutMe: 'Usuario local para testes de rotas protegidas.',
  linkedin: '',
  github: '',
  curriculoLattes: '',
  courseName: 'Curso de Teste',
  institutionName: 'Atlas',
}

export function AuthProvider({ children }: PropsWithChildren) {
  const navigate = useNavigate()
  const [user, setUser] = useState<AuthUser | null>(() =>
    authBypassEnabled ? authBypassUser : null,
  )
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    authBypassEnabled ? 'dev-auth-bypass-access-token' : null,
  )
  const [refreshToken, setRefreshToken] = useState<string | null>(() =>
    authBypassEnabled ? 'dev-auth-bypass-refresh-token' : null,
  )
  const isAuthenticated = Boolean(user && accessToken)

  const login = useCallback((data: LoginData) => {
    setUser(data.user)
    setAccessToken(data.accessToken)
    setRefreshToken(data.refreshToken)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)
  }, [])

  useEffect(() => {
    return setApiAuthHandlers({
      getAccessToken: () => accessToken,
      onUnauthorized: () => {
        logout()
        navigate('/login', { replace: true })
      },
    })
  }, [accessToken, logout, navigate])

  const value = useMemo(
    () => ({ user, accessToken, refreshToken, isAuthenticated, login, logout }),
    [user, accessToken, refreshToken, isAuthenticated, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
