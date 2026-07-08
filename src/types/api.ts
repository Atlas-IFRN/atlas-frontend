export interface PaginatedResponse<T> {
  data: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type ScholarshipStatus =
  | 'Draft'
  | 'Open'
  | 'RegistrationClosed'
  | 'Closed'

export type ScholarshipApplicationStatus =
  | 'Cancelled'
  | 'Enrolled'
  | 'Approved'
  | 'Rejected'

export interface ScholarshipTechnology {
  id: string
  name: string
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
  technologies: ScholarshipTechnology[]
  userApplication: ScholarshipUserApplication | null
  registrationEnd: string | null
  createdAt: string
  updatedAt: string
}
