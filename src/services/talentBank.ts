import axios from 'axios'
import api from './api'
import type { AuthUser } from '../contexts/AuthContext'
import { toAuthUser, type SuapUserResponse } from './auth'
import { getCompletedTracks, type CompletedTrack } from './tracks'

export type TalentRegistrationStatus = 'Active' | 'Inactive'

interface TalentRegistrationApi {
  id: string
  student_id: string
  status: TalentRegistrationStatus
  status_changed_by?: string | null
  status_changed_at?: string | null
  joined_at: string
  /** Perfil do aluno embutido pelo backend (resolvido em lote no auth). */
  student?: SuapUserResponse | null
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
  /** Perfil do aluno já resolvido (embutido pelo backend); null se o auth falhou. */
  student: AuthUser | null
}

export interface TalentBankStudent {
  completedTracks: CompletedTrack[] | null
  registration: TalentRegistration
  student: AuthUser
}

export interface TalentBankDirectory {
  registrations: TalentRegistration[]
  students: TalentBankStudent[]
}

const TALENT_BANK_PATH = 'scholarship/talents/talent-bank/'
const DIRECTORY_REQUEST_CONCURRENCY = 6

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex
      nextIndex += 1
      results[currentIndex] = await mapper(items[currentIndex])
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  )
  await Promise.all(workers)
  return results
}

function toTalentRegistration(
  registration: TalentRegistrationApi,
): TalentRegistration {
  return {
    id: registration.id,
    studentId: registration.student_id,
    status: registration.status,
    statusChangedAt: registration.status_changed_at ?? null,
    joinedAt: registration.joined_at,
    student: registration.student ? toAuthUser(registration.student) : null,
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

export async function getActiveTalentRegistrations(): Promise<
  TalentRegistration[]
> {
  const registrations: TalentRegistration[] = []
  let page = 1
  let hasNextPage = true

  while (hasNextPage) {
    const { data } = await api.get<PaginatedTalentRegistrationsApi>(
      TALENT_BANK_PATH,
      {
        params: { page, page_size: 50, status: 'Active' },
      },
    )

    registrations.push(...data.results.map(toTalentRegistration))
    hasNextPage = Boolean(data.next)
    page += 1
  }

  return [
    ...new Map(
      registrations.map((registration) => [
        registration.studentId,
        registration,
      ]),
    ).values(),
  ]
}

export async function getActiveTalentStudents(): Promise<AuthUser[]> {
  // O perfil de cada aluno já vem embutido (`student`) na resposta do
  // talent-bank — o backend resolve todos em lote no auth. Sem N+1 no front.
  const students: AuthUser[] = []
  const seen = new Set<string>()
  let page = 1
  let hasNextPage = true

  while (hasNextPage) {
    const { data } = await api.get<PaginatedTalentRegistrationsApi>(
      TALENT_BANK_PATH,
      { params: { page, page_size: 50, status: 'Active' } },
    )

    for (const registration of data.results) {
      if (registration.student && !seen.has(registration.student_id)) {
        seen.add(registration.student_id)
        students.push(toAuthUser(registration.student))
      }
    }

    hasNextPage = Boolean(data.next)
    page += 1
  }

  return students.filter((student) =>
    ['student', 'aluno'].includes(student.role.trim().toLowerCase()),
  )
}

export async function getTalentBankDirectory(): Promise<TalentBankDirectory> {
  const registrations = await getActiveTalentRegistrations()
  const studentResults = await mapWithConcurrency(
    registrations,
    DIRECTORY_REQUEST_CONCURRENCY,
    async (registration) => {
      // Perfil já vem embutido (resolvido em lote no auth) — sem chamada por
      // aluno ao auth. Só as trilhas concluídas continuam vindo do track-service.
      const student = registration.student
      if (!student) {
        return null
      }

      const role = student.role.trim().toLowerCase()
      if (!['student', 'aluno'].includes(role)) {
        return null
      }

      let completedTracks: CompletedTrack[] | null = null
      try {
        completedTracks = await getCompletedTracks(registration.studentId)
      } catch {
        completedTracks = null
      }

      return { completedTracks, registration, student }
    },
  )
  const students = studentResults.flatMap((student) =>
    student ? [student] : [],
  )

  return { registrations, students }
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
