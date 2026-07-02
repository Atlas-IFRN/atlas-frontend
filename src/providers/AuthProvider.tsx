import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AuthContext,
  type AuthUser,
  type LoginData,
} from '../contexts/AuthContext'
import { setApiAuthHandlers } from '../services/api'

const AUTH_ACCESS_TOKEN_KEY = 'atlas.auth.access'
const AUTH_REFRESH_TOKEN_KEY = 'atlas.auth.refresh'
const AUTH_USER_KEY = 'atlas.auth.user'

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
const authBypassSession: LoginData = {
  user: authBypassUser,
  accessToken: 'dev-auth-bypass-access-token',
  refreshToken: 'dev-auth-bypass-refresh-token',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isStoredAuthUser(value: unknown): value is AuthUser {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.firstName === 'string' &&
    typeof value.fullName === 'string' &&
    typeof value.role === 'string'
  )
}

function readStoredSession(): LoginData | null {
  try {
    const accessToken = localStorage.getItem(AUTH_ACCESS_TOKEN_KEY)
    const refreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_KEY)
    const storedUser = localStorage.getItem(AUTH_USER_KEY)

    if (!accessToken || !refreshToken || !storedUser) {
      return null
    }

    const user = JSON.parse(storedUser) as unknown

    if (!isStoredAuthUser(user)) {
      return null
    }

    return { user, accessToken, refreshToken }
  } catch {
    return null
  }
}

function writeStoredSession(data: LoginData) {
  localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, data.accessToken)
  localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, data.refreshToken)
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user))
}

function clearStoredSession() {
  localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY)
  localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}

export function AuthProvider({ children }: PropsWithChildren) {
  const navigate = useNavigate()
  const [session, setSession] = useState<LoginData | null>(() =>
    authBypassEnabled ? authBypassSession : readStoredSession(),
  )
  const user = session?.user ?? null
  const accessToken = session?.accessToken ?? null
  const refreshToken = session?.refreshToken ?? null
  const isAuthenticated = Boolean(user && accessToken)

  const login = useCallback((data: LoginData) => {
    setSession(data)
    writeStoredSession(data)
  }, [])

  const logout = useCallback(() => {
    setSession(null)
    clearStoredSession()
  }, [])

  useEffect(() => {
    return setApiAuthHandlers({
      getAccessToken: () => accessToken,
      onUnauthorized: () => {
        logout()
        navigate('/entrar', { replace: true })
      },
    })
  }, [accessToken, logout, navigate])

  const value = useMemo(
    () => ({ user, accessToken, refreshToken, isAuthenticated, login, logout }),
    [user, accessToken, refreshToken, isAuthenticated, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
