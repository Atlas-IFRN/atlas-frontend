import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import {
  AuthContext,
  type AuthUser,
  type LoginData,
} from '../contexts/AuthContext'
import { setApiAuthHandlers } from '../services/api'

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
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
    })
  }, [accessToken])

  const value = useMemo(
    () => ({ user, accessToken, refreshToken, isAuthenticated, login, logout }),
    [user, accessToken, refreshToken, isAuthenticated, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}