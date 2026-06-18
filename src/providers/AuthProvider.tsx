import { useCallback, useMemo, useState, type PropsWithChildren } from 'react'
import {
  AuthContext,
  type AuthUser,
  type LoginData,
} from '../contexts/AuthContext'

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)

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

  const value = useMemo(
    () => ({ user, accessToken, refreshToken, login, logout }),
    [user, accessToken, refreshToken, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
