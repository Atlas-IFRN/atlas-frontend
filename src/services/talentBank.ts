import axios from 'axios'
import api from './api'

export type TalentRegistrationStatus = 'Active' | 'Inactive'

interface TalentRegistrationApi {
  id: string
  student_id: string
  status: TalentRegistrationStatus
  status_changed_by?: string | null
  status_changed_at?: string | null
  joined_at: string
}

interface PaginatedTalentRegistrationsApi {
  count: number
  next: string | null
  previous: string | null
  results: TalentRegistrationApi[]
}

export interface TalentRegistration {
  id: string
  studentId: string
  status: TalentRegistrationStatus
  statusChangedAt: string | null
  joinedAt: string
}

const TALENT_BANK_PATH = 'scholarship/talents/talent-bank/'

function toTalentRegistration(
  registration: TalentRegistrationApi,
): TalentRegistration {
  return {
    id: registration.id,
    studentId: registration.student_id,
    status: registration.status,
    statusChangedAt: registration.status_changed_at ?? null,
    joinedAt: registration.joined_at,
  }
}

export async function getMyTalentRegistration(): Promise<TalentRegistration | null> {
  const { data } = await api.get<PaginatedTalentRegistrationsApi>(
    TALENT_BANK_PATH,
    { params: { page_size: 1 } },
  )
  const registration = data.results[0]

  return registration ? toTalentRegistration(registration) : null
}

export async function createTalentRegistration(): Promise<TalentRegistration> {
  const { data } = await api.post<TalentRegistrationApi>(TALENT_BANK_PATH, {})

  return toTalentRegistration(data)
}

export async function activateTalentRegistration(): Promise<TalentRegistration> {
  const { data } = await api.patch<TalentRegistrationApi>(
    `${TALENT_BANK_PATH}activate/`,
    {},
  )

  return toTalentRegistration(data)
}

export async function deactivateTalentRegistration(): Promise<TalentRegistration> {
  const { data } = await api.patch<TalentRegistrationApi>(
    `${TALENT_BANK_PATH}deactivate/`,
    {},
  )

  return toTalentRegistration(data)
}

export function getTalentBankErrorMessage(
  error: unknown,
  fallback = 'Não foi possível concluir a ação.',
) {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback
  }

  const data = error.response?.data
  if (typeof data === 'string') {
    return data
  }

  if (!data || typeof data !== 'object') {
    return fallback
  }

  const detail = (data as Record<string, unknown>).detail
  if (typeof detail === 'string') {
    return detail
  }

  return fallback
}
