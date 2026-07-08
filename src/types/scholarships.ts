export interface PaginatedResponse<T> {
  data: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type ScholarshipStatus =
  'Draft' | 'Open' | 'RegistrationClosed' | 'Closed'

export type ScholarshipApplicationStatus =
  'Cancelled' | 'Enrolled' | 'Approved' | 'Rejected'

export interface ScholarshipTechnology {
  id: string
  name: string
}

export interface ScholarshipLink {
  id: string
  label: string
  url: string
  displayOrder: number
}

export interface ScholarshipRequirement {
  id: string
  title: string
  description: string
  displayOrder: number
}

export type ScholarshipPhaseType =
  'Registration' | 'Selection' | 'Result' | 'Other'

export interface ScholarshipPhase {
  id: string
  title: string | null
  startDate: string
  endDate: string
  type: ScholarshipPhaseType
  displayOrder: number
}

export interface ScholarshipUserApplication {
  applied: boolean
  applicationId: string | null
  status: ScholarshipApplicationStatus | null
}

export interface Scholarship {
  id: string
  title: string
  description: string
  activityDescription: string
  valuePerMonth: number
  durationInMonths: number
  vacancies: number
  minimumPeriod: number
  minimumIra: number
  publishedBy: string
  status: ScholarshipStatus
  phases: ScholarshipPhase[]
  links: ScholarshipLink[]
  requirements: ScholarshipRequirement[]
  technologies: ScholarshipTechnology[]
  userApplication: ScholarshipUserApplication | null
  registrationEnd: string | null
  createdAt: string
  updatedAt: string
}

export interface ScholarshipLinkInput {
  label: string
  url: string
  displayOrder: number
}

export interface ScholarshipRequirementInput {
  title: string
  description: string
  displayOrder: number
}

export interface ScholarshipPhaseInput {
  title: string | null
  startDate: string
  endDate: string
  type: ScholarshipPhaseType
  displayOrder: number
}

export interface CreateScholarshipInput {
  title: string
  description: string
  activityDescription: string
  valuePerMonth: number
  durationInMonths: number
  vacancies: number
  minimumPeriod: number
  minimumIra: number
  status: ScholarshipStatus
  technologyIds: string[]
  phases: ScholarshipPhaseInput[]
  links: ScholarshipLinkInput[]
  requirements: ScholarshipRequirementInput[]
}
