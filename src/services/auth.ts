import api from './api'
import type { AuthUser, LoginData } from '../contexts/AuthContext'

interface SuapLoginResponse {
  login_url: string
}

interface SuapUserResponse {
  id?: string | number
  registration_number?: string | null
  matricula?: string | null
  first_name?: string | null
  firstName?: string | null
  full_name?: string | null
  fullName?: string | null
  email?: string | null
  role?: string | null
  ira?: number | string | null
  period?: number | string | null
  about_me?: string | null
  aboutMe?: string | null
  linkedin?: string | null
  github?: string | null
  lattes_url?: string | null
  curriculoLattes?: string | null
  course_name?: string | null
  courseName?: string | null
  institution_name?: string | null
  institutionName?: string | null
  is_new_user?: boolean
  isNewUser?: boolean
}

interface SuapCallbackResponse {
  access: string
  refresh: string
  user: SuapUserResponse
}

function toStringValue(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value)
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : null
}

function toAuthUser(user: SuapUserResponse): AuthUser {
  const firstName = toStringValue(user.first_name ?? user.firstName)
  const fullName = toStringValue(user.full_name ?? user.fullName) || firstName
  const isNewUser = user.is_new_user ?? user.isNewUser

  return {
    id: toStringValue(user.id),
    matricula: toStringValue(user.registration_number ?? user.matricula),
    firstName,
    fullName,
    email: toStringValue(user.email),
    role: toStringValue(user.role),
    ira: toNullableNumber(user.ira),
    period: toNullableNumber(user.period),
    aboutMe: toStringValue(user.about_me ?? user.aboutMe),
    linkedin: toStringValue(user.linkedin),
    github: toStringValue(user.github),
    curriculoLattes: toStringValue(user.lattes_url ?? user.curriculoLattes),
    courseName: toStringValue(user.course_name ?? user.courseName),
    institutionName: toStringValue(
      user.institution_name ?? user.institutionName,
    ),
    isNewUser: isNewUser === undefined ? undefined : Boolean(isNewUser),
  }
}

export async function getSuapLoginUrl(): Promise<string> {
  const { data } = await api.get<SuapLoginResponse>('auth/suap/login/')

  return data.login_url
}

export async function exchangeSuapCodeForSession(
  code: string,
): Promise<LoginData> {
  const { data } = await api.post<SuapCallbackResponse>(
    'auth/suap/callback/',
    { code },
  )

  if (!data.access || !data.refresh || !data.user?.role) {
    throw new Error('Invalid SUAP callback response')
  }

  return {
    accessToken: data.access,
    refreshToken: data.refresh,
    user: toAuthUser(data.user),
  }
}
