import { createContext, useContext } from 'react'

export interface AuthUser {
  id: string
  matricula: string
  firstName: string
  fullName: string
  email: string
  role: string
  image: string
  ira: number | null
  period: number | null
  aboutMe: string
  linkedin: string
  github: string
  curriculoLattes: string
  courseName: string
  institutionName: string
  isNewUser?: boolean
}

export interface LoginData {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

export interface EditableProfileFields {
  aboutMe: string
  linkedin: string
  github: string
}

export interface AuthContextValue {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (data: LoginData) => void
  logout: () => void
  refreshUser: () => Promise<AuthUser | null>
  updateProfile: (fields: EditableProfileFields) => Promise<AuthUser>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
