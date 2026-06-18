import { createContext, useContext } from 'react'

export interface AuthUser {
  id: string
  matricula: string
  firstName: string
  fullName: string
  email: string
  role: string
  ira: number
  period: number
  aboutMe: string
  linkedin: string
  github: string
  curriculoLattes: string
  courseName: string
  institutionName: string
}

export interface LoginData {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

export interface AuthContextValue {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  login: (data: LoginData) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
