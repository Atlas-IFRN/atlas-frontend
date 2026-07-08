import api from './api'
import type {
  PaginatedResponse,
  Scholarship,
  ScholarshipApplicationStatus,
  ScholarshipLink,
  ScholarshipPhase,
  ScholarshipPhaseType,
  ScholarshipRequirement,
  ScholarshipStatus,
  ScholarshipUserApplication,
} from '../types/scholarships'

interface ScholarshipTechnologyApi {
  id: string
  name: string
}

interface ScholarshipUserApplicationApi {
  applied: boolean
  application_id: string | null
  status: ScholarshipApplicationStatus | null
}

interface ScholarshipLinkApi {
  id: string
  label: string
  url: string
  display_order: number
}

interface ScholarshipRequirementApi {
  id: string
  title: string
  description: string
  display_order: number
}

interface ScholarshipPhaseApi {
  id: string
  title: string | null
  start_date: string
  end_date: string
  type: ScholarshipPhaseType
  display_order: number
}

interface ScholarshipApi {
  id: string
  title: string
  description: string
  activity_description?: string | null
  value_per_month: number | string
  duration_in_months: number
  vacancies: number
  minimum_period: number
  minimum_ira: number | string
  published_by: string
  status: ScholarshipStatus
  phases?: ScholarshipPhaseApi[]
  links?: ScholarshipLinkApi[]
  requirements?: ScholarshipRequirementApi[]
  technologies?: ScholarshipTechnologyApi[]
  user_application?: ScholarshipUserApplicationApi | null
  registration_end?: string | null
  created_at: string
  updated_at: string
}

interface DrfPaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

type ScholarshipListApiResponse =
  | ScholarshipApi[]
  | DrfPaginatedResponse<ScholarshipApi>
  | PaginatedResponse<ScholarshipApi>

export interface ScholarshipListParams {
  ordering?:
    'created_at' | '-created_at' | 'registration_end' | '-registration_end'
  page?: number
  pageSize?: number
  status?: ScholarshipStatus
  technology?: string
}

export interface ScholarshipListResult {
  items: Scholarship[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface ScholarshipApplication {
  id: string
  scholarship: string
  studentId: string
  status: ScholarshipApplicationStatus
  appliedAt: string
  updatedAt: string
}

interface ScholarshipApplicationApi {
  id: string
  scholarship: string
  student_id: string
  status: ScholarshipApplicationStatus
  applied_at: string
  updated_at: string
}

function toNumber(value: number | string): number {
  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : 0
}

function toUserApplication(
  application: ScholarshipUserApplicationApi | null | undefined,
): ScholarshipUserApplication | null {
  if (!application) {
    return null
  }

  return {
    applied: application.applied,
    applicationId: application.application_id,
    status: application.status,
  }
}

function toLink(link: ScholarshipLinkApi): ScholarshipLink {
  return {
    id: link.id,
    label: link.label,
    url: link.url,
    displayOrder: link.display_order,
  }
}

function toRequirement(
  requirement: ScholarshipRequirementApi,
): ScholarshipRequirement {
  return {
    id: requirement.id,
    title: requirement.title,
    description: requirement.description,
    displayOrder: requirement.display_order,
  }
}

function toPhase(phase: ScholarshipPhaseApi): ScholarshipPhase {
  return {
    id: phase.id,
    title: phase.title,
    startDate: phase.start_date,
    endDate: phase.end_date,
    type: phase.type,
    displayOrder: phase.display_order,
  }
}

function getRegistrationEnd(
  registrationEnd: string | null | undefined,
  phases: ScholarshipPhase[],
) {
  if (registrationEnd) {
    return registrationEnd
  }

  return phases.find((phase) => phase.type === 'Registration')?.endDate ?? null
}

function toScholarship(scholarship: ScholarshipApi): Scholarship {
  const phases = (scholarship.phases ?? []).map(toPhase)

  return {
    id: scholarship.id,
    title: scholarship.title,
    description: scholarship.description,
    activityDescription: scholarship.activity_description ?? '',
    valuePerMonth: toNumber(scholarship.value_per_month),
    durationInMonths: scholarship.duration_in_months,
    vacancies: scholarship.vacancies,
    minimumPeriod: scholarship.minimum_period,
    minimumIra: toNumber(scholarship.minimum_ira),
    publishedBy: scholarship.published_by,
    status: scholarship.status,
    phases,
    links: (scholarship.links ?? []).map(toLink),
    requirements: (scholarship.requirements ?? []).map(toRequirement),
    technologies: scholarship.technologies ?? [],
    userApplication: toUserApplication(scholarship.user_application),
    registrationEnd: getRegistrationEnd(scholarship.registration_end, phases),
    createdAt: scholarship.created_at,
    updatedAt: scholarship.updated_at,
  }
}

function isDrfResponse(
  response: ScholarshipListApiResponse,
): response is DrfPaginatedResponse<ScholarshipApi> {
  return !Array.isArray(response) && 'results' in response
}

function isAtlasPaginatedResponse(
  response: ScholarshipListApiResponse,
): response is PaginatedResponse<ScholarshipApi> {
  return !Array.isArray(response) && 'data' in response
}

function normalizeListResponse(
  response: ScholarshipListApiResponse,
  page: number,
  pageSize: number,
): ScholarshipListResult {
  if (Array.isArray(response)) {
    return {
      items: response.map(toScholarship),
      page,
      pageSize,
      total: response.length,
      totalPages: 1,
    }
  }

  if (isDrfResponse(response)) {
    return {
      items: response.results.map(toScholarship),
      page,
      pageSize,
      total: response.count,
      totalPages: Math.max(1, Math.ceil(response.count / pageSize)),
    }
  }

  if (isAtlasPaginatedResponse(response)) {
    return {
      items: response.data.map(toScholarship),
      page: response.page,
      pageSize: response.pageSize,
      total: response.total,
      totalPages: response.totalPages,
    }
  }

  return {
    items: [],
    page,
    pageSize,
    total: 0,
    totalPages: 1,
  }
}

function toApplication(
  application: ScholarshipApplicationApi,
): ScholarshipApplication {
  return {
    id: application.id,
    scholarship: application.scholarship,
    studentId: application.student_id,
    status: application.status,
    appliedAt: application.applied_at,
    updatedAt: application.updated_at,
  }
}

export async function listScholarships({
  ordering = 'registration_end',
  page = 1,
  pageSize = 50,
  status,
  technology,
}: ScholarshipListParams = {}): Promise<ScholarshipListResult> {
  const params: Record<string, number | string> = {
    ordering,
    page,
    page_size: pageSize,
  }

  if (status) {
    params.status = status
  }

  if (technology) {
    params.technology = technology
  }

  const { data } = await api.get<ScholarshipListApiResponse>(
    'scholarship/scholarships/',
    { params },
  )

  return normalizeListResponse(data, page, pageSize)
}

export async function getScholarship(
  scholarshipId: string,
): Promise<Scholarship> {
  const { data } = await api.get<ScholarshipApi>(
    `scholarship/scholarships/${scholarshipId}/`,
  )

  return toScholarship(data)
}

export async function applyToScholarship(
  scholarshipId: string,
): Promise<ScholarshipApplication> {
  const { data } = await api.post<ScholarshipApplicationApi>(
    `scholarship/scholarships/${scholarshipId}/apply/`,
  )

  return toApplication(data)
}

export async function cancelScholarshipApplication(
  scholarshipId: string,
): Promise<ScholarshipApplication> {
  const { data } = await api.patch<ScholarshipApplicationApi>(
    `scholarship/scholarships/${scholarshipId}/cancel/`,
  )

  return toApplication(data)
}
