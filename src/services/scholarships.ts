import api from './api'
import type {
  CreateScholarshipInput,
  PaginatedResponse,
  Scholarship,
  ScholarshipApplicationStatus,
  ScholarshipLink,
  ScholarshipPhase,
  ScholarshipPhaseType,
  ScholarshipRequirement,
  ScholarshipStatus,
  ScholarshipTechnology,
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

interface ScholarshipLinkPayload {
  label: string
  url: string
  display_order: number
}

interface ScholarshipRequirementPayload {
  title: string
  description: string
  display_order: number
}

interface ScholarshipPhasePayload {
  title: string | null
  start_date: string
  end_date: string
  type: ScholarshipPhaseType
  display_order: number
}

interface CreateScholarshipPayload {
  title: string
  description: string
  activity_description: string
  value_per_month: number
  duration_in_months: number
  vacancies: number
  minimum_period: number
  minimum_ira: number
  status: ScholarshipStatus
  technologies: string[]
  phases: ScholarshipPhasePayload[]
  links: ScholarshipLinkPayload[]
  requirements: ScholarshipRequirementPayload[]
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

type ScholarshipTechnologyApiResponse =
  | ScholarshipTechnologyApi[]
  | DrfPaginatedResponse<ScholarshipTechnologyApi>
  | PaginatedResponse<ScholarshipTechnologyApi>

type ApiListResponse<T> =
  | T[]
  | DrfPaginatedResponse<T>
  | PaginatedResponse<T>

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
  student: ScholarshipApplicationStudent | null
  studentId: string
  status: ScholarshipApplicationStatus
  appliedAt: string
  updatedAt: string
}

export interface ScholarshipApplicationStudent {
  id: string
  matricula: string
  firstName: string
  fullName: string
  email: string
  role: string
  ira: number | null
  period: number | null
  courseName: string
  institutionName: string
}

interface ScholarshipApplicationStudentApi {
  id?: string | null
  matricula?: string | null
  first_name?: string | null
  full_name?: string | null
  email?: string | null
  role?: string | null
  ira?: number | string | null
  period?: number | string | null
  course_name?: string | null
  institution_name?: string | null
}

interface ScholarshipApplicationApi {
  id: string
  scholarship: string
  student?: ScholarshipApplicationStudentApi | null
  student_id: string
  status: ScholarshipApplicationStatus
  applied_at: string
  updated_at: string
}

type ScholarshipApplicationListApiResponse =
  ApiListResponse<ScholarshipApplicationApi>

export interface ScholarshipApplicationListParams {
  ordering?:
    | 'status'
    | '-status'
    | 'applied_at'
    | '-applied_at'
    | 'updated_at'
    | '-updated_at'
  page?: number
  pageSize?: number
  scholarship?: string
}

export interface ScholarshipApplicationListResult {
  items: ScholarshipApplication[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

function toNumber(value: number | string): number {
  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : 0
}

function toNullableNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : null
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

function toTechnology(
  technology: ScholarshipTechnologyApi,
): ScholarshipTechnology {
  return {
    id: technology.id,
    name: technology.name,
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

function isDrfResponse<T>(
  response: ApiListResponse<T>,
): response is DrfPaginatedResponse<T> {
  return !Array.isArray(response) && 'results' in response
}

function isAtlasPaginatedResponse<T>(
  response: ApiListResponse<T>,
): response is PaginatedResponse<T> {
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

function normalizeTechnologyListResponse(
  response: ScholarshipTechnologyApiResponse,
): ScholarshipTechnology[] {
  if (Array.isArray(response)) {
    return response.map(toTechnology)
  }

  if (isDrfResponse(response)) {
    return response.results.map(toTechnology)
  }

  if (isAtlasPaginatedResponse(response)) {
    return response.data.map(toTechnology)
  }

  return []
}

function normalizeApplicationListResponse(
  response: ScholarshipApplicationListApiResponse,
  page: number,
  pageSize: number,
): ScholarshipApplicationListResult {
  if (Array.isArray(response)) {
    return {
      items: response.map(toApplication),
      page,
      pageSize,
      total: response.length,
      totalPages: 1,
    }
  }

  if (isDrfResponse(response)) {
    return {
      items: response.results.map(toApplication),
      page,
      pageSize,
      total: response.count,
      totalPages: Math.max(1, Math.ceil(response.count / pageSize)),
    }
  }

  if (isAtlasPaginatedResponse(response)) {
    return {
      items: response.data.map(toApplication),
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

function toCreateScholarshipPayload(
  scholarship: CreateScholarshipInput,
): CreateScholarshipPayload {
  return {
    title: scholarship.title,
    description: scholarship.description,
    activity_description: scholarship.activityDescription,
    value_per_month: scholarship.valuePerMonth,
    duration_in_months: scholarship.durationInMonths,
    vacancies: scholarship.vacancies,
    minimum_period: scholarship.minimumPeriod,
    minimum_ira: scholarship.minimumIra,
    status: scholarship.status,
    technologies: scholarship.technologyIds,
    phases: scholarship.phases.map((phase) => ({
      title: phase.title,
      start_date: phase.startDate,
      end_date: phase.endDate,
      type: phase.type,
      display_order: phase.displayOrder,
    })),
    links: scholarship.links.map((link) => ({
      label: link.label,
      url: link.url,
      display_order: link.displayOrder,
    })),
    requirements: scholarship.requirements.map((requirement) => ({
      title: requirement.title,
      description: requirement.description,
      display_order: requirement.displayOrder,
    })),
  }
}

function toApplication(
  application: ScholarshipApplicationApi,
): ScholarshipApplication {
  return {
    id: application.id,
    scholarship: application.scholarship,
    student: toApplicationStudent(application.student),
    studentId: application.student_id,
    status: application.status,
    appliedAt: application.applied_at,
    updatedAt: application.updated_at,
  }
}

function toApplicationStudent(
  student: ScholarshipApplicationStudentApi | null | undefined,
): ScholarshipApplicationStudent | null {
  if (!student) {
    return null
  }

  return {
    id: student.id ?? '',
    matricula: student.matricula ?? '',
    firstName: student.first_name ?? '',
    fullName: student.full_name ?? student.first_name ?? '',
    email: student.email ?? '',
    role: student.role ?? '',
    ira: toNullableNumber(student.ira),
    period: toNullableNumber(student.period),
    courseName: student.course_name ?? '',
    institutionName: student.institution_name ?? '',
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

export async function createScholarship(
  scholarship: CreateScholarshipInput,
): Promise<Scholarship> {
  const { data } = await api.post<ScholarshipApi>(
    'scholarship/scholarships/',
    toCreateScholarshipPayload(scholarship),
  )

  return toScholarship(data)
}

export async function listScholarshipTechnologies(): Promise<
  ScholarshipTechnology[]
> {
  const { data } = await api.get<ScholarshipTechnologyApiResponse>(
    'scholarship/technologies/',
    { params: { page_size: 200 } },
  )

  return normalizeTechnologyListResponse(data)
}

export async function listScholarshipApplications({
  ordering = '-applied_at',
  page = 1,
  pageSize = 50,
  scholarship,
}: ScholarshipApplicationListParams = {}): Promise<ScholarshipApplicationListResult> {
  const params: Record<string, number | string> = {
    ordering,
    page,
    page_size: pageSize,
  }

  if (scholarship) {
    params.scholarship = scholarship
  }

  const { data } = await api.get<ScholarshipApplicationListApiResponse>(
    'scholarship/applications/',
    { params },
  )

  return normalizeApplicationListResponse(data, page, pageSize)
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

export async function approveScholarshipApplication(
  applicationId: string,
): Promise<ScholarshipApplication> {
  const { data } = await api.patch<ScholarshipApplicationApi>(
    `scholarship/applications/${applicationId}/approve/`,
  )

  return toApplication(data)
}

export async function rejectScholarshipApplication(
  applicationId: string,
): Promise<ScholarshipApplication> {
  const { data } = await api.patch<ScholarshipApplicationApi>(
    `scholarship/applications/${applicationId}/reprove/`,
  )

  return toApplication(data)
}
