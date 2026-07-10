import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import {
  ChevronDown,
  Plus,
  Trash2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/atoms/Button'
import {
  TechIcon,
  TechTag,
  techIconColors,
  type TechIconName,
  type TechTagCategory,
} from '../../components/atoms/TechTag'
import { ScholarshipCard } from '../../components/molecules/ScholarshipCard'
import {
  createScholarship,
  listScholarshipTechnologies,
} from '../../services/scholarships'
import type {
  CreateScholarshipInput,
  Scholarship,
  ScholarshipPhaseType,
  ScholarshipStatus,
  ScholarshipTechnology,
} from '../../types/scholarships'
import './CreateScholarshipPage.css'

type FormSection = 'identification' | 'details' | 'schedule' | 'publish'

interface RequirementDraft {
  id: string
  title: string
  description: string
}

interface PhaseDraft {
  id: string
  title: string
  startDate: string
  endDate: string
  type: ScholarshipPhaseType
}

interface LinkDraft {
  id: string
  label: string
  url: string
}

interface ScholarshipFormState {
  title: string
  description: string
  activityDescription: string
  valuePerMonth: string
  durationInMonths: string
  vacancies: string
  minimumPeriod: string
  minimumIra: string
  status: Extract<ScholarshipStatus, 'Draft' | 'Open'>
  selectedTechnologyIds: string[]
  requirements: RequirementDraft[]
  phases: PhaseDraft[]
  links: LinkDraft[]
}

interface ApiErrorBody {
  detail?: unknown
}

type ValidationErrors = Record<string, string[]>

const draftStorageKey = 'atlas:create-scholarship-form'
const registrationPhaseId = 'registration-phase'
const emptyTechnologies: ScholarshipTechnology[] = []

const phaseTypeLabels: Record<ScholarshipPhaseType, string> = {
  Other: 'Outra',
  Registration: 'Inscrições',
  Result: 'Resultado',
  Selection: 'Seleção',
}

const technologyMetaByName: Record<
  string,
  { category: TechTagCategory; icon: TechIconName }
> = {
  angular: { category: 'framework', icon: 'angular' },
  c: { category: 'language', icon: 'c' },
  'c++': { category: 'language', icon: 'c-plus-plus' },
  docker: { category: 'infra', icon: 'docker' },
  figma: { category: 'tool', icon: 'figma' },
  git: { category: 'tool', icon: 'git' },
  go: { category: 'language', icon: 'go' },
  java: { category: 'language', icon: 'java' },
  kubernetes: { category: 'infra', icon: 'kubernetes' },
  mongodb: { category: 'infra', icon: 'mongodb' },
  'mongo db': { category: 'infra', icon: 'mongodb' },
  mqtt: { category: 'tool', icon: 'apache-kafka' },
  'next.js': { category: 'framework', icon: 'nextjs' },
  nextjs: { category: 'framework', icon: 'nextjs' },
  'node.js': { category: 'framework', icon: 'nodejs' },
  nodejs: { category: 'framework', icon: 'nodejs' },
  postgresql: { category: 'infra', icon: 'postgresql' },
  postgres: { category: 'infra', icon: 'postgresql' },
  postman: { category: 'tool', icon: 'postman' },
  python: { category: 'language', icon: 'python' },
  'raspberry pi': { category: 'infra', icon: 'raspberry-pi' },
  react: { category: 'framework', icon: 'react' },
  redis: { category: 'infra', icon: 'redis' },
  rust: { category: 'language', icon: 'rust' },
  spring: { category: 'framework', icon: 'spring' },
  tensorflow: { category: 'framework', icon: 'tensorflow' },
  typescript: { category: 'language', icon: 'typescript' },
  vite: { category: 'tool', icon: 'vite' },
  vue: { category: 'framework', icon: 'vue' },
}

const formSteps: Array<{
  id: FormSection
  label: string
  description: string
}> = [
  {
    id: 'identification',
    label: 'Identificação',
    description: 'Título e descrições',
  },
  {
    id: 'details',
    label: 'Detalhes',
    description: 'Vagas e requisitos',
  },
  {
    id: 'schedule',
    label: 'Cronograma',
    description: 'Etapas',
  },
  {
    id: 'publish',
    label: 'Links',
    description: 'Materiais relacionados',
  },
]

function createDraftId(prefix: string) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function formatDateInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getTechnologyMeta(name: string) {
  return technologyMetaByName[name.trim().toLowerCase()]
}

function getDefaultFormState(): ScholarshipFormState {
  const today = new Date()
  const registrationStart = formatDateInput(today)
  const registrationEnd = formatDateInput(addDays(today, 14))

  return {
    title: '',
    description: '',
    activityDescription: '',
    valuePerMonth: '700',
    durationInMonths: '12',
    vacancies: '2',
    minimumPeriod: '3',
    minimumIra: '7',
    status: 'Draft',
    selectedTechnologyIds: [],
    requirements: [
      {
        id: createDraftId('requirement'),
        title: '',
        description: '',
      },
    ],
    phases: [
      {
        id: registrationPhaseId,
        title: '',
        startDate: registrationStart,
        endDate: registrationEnd,
        type: 'Registration',
      },
    ],
    links: [
      {
        id: createDraftId('link'),
        label: '',
        url: '',
      },
    ],
  }
}

function getStoredFormState() {
  const fallback = getDefaultFormState()

  if (typeof window === 'undefined') {
    return fallback
  }

  const rawDraft = window.localStorage.getItem(draftStorageKey)

  if (!rawDraft) {
    return fallback
  }

  try {
    const stored = JSON.parse(rawDraft) as Partial<ScholarshipFormState>
    const storedLinks = Array.isArray(stored.links)
      ? stored.links
      : fallback.links
    const links =
      storedLinks.length === 1 &&
      storedLinks[0]?.label === 'Edital completo' &&
      !storedLinks[0]?.url
        ? fallback.links
        : storedLinks

    return {
      ...fallback,
      ...stored,
      links,
      phases: Array.isArray(stored.phases) ? stored.phases : fallback.phases,
      requirements: Array.isArray(stored.requirements)
        ? stored.requirements
        : fallback.requirements,
      selectedTechnologyIds: Array.isArray(stored.selectedTechnologyIds)
        ? stored.selectedTechnologyIds
        : fallback.selectedTechnologyIds,
    }
  } catch {
    return fallback
  }
}

function parseLocaleNumber(value: string) {
  const parsed = Number(value.replace(',', '.'))

  return Number.isFinite(parsed) ? parsed : 0
}

function parseInteger(value: string) {
  const parsed = Number.parseInt(value, 10)

  return Number.isFinite(parsed) ? parsed : 0
}

function toDateTime(date: string, endOfDay = false) {
  if (!date) {
    return null
  }

  const time = endOfDay ? '23:59:59' : '00:00:00'
  const parsed = new Date(`${date}T${time}`)

  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed.toISOString()
}

function compareDateInputs(start: string, end: string) {
  if (!start || !end) {
    return 0
  }

  return start.localeCompare(end)
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function getRegistrationPhase(phases: PhaseDraft[]) {
  return (
    phases.find((phase) => phase.id === registrationPhaseId) ??
    phases.find((phase) => phase.type === 'Registration') ??
    phases[0]
  )
}

function getReadableError(detail: unknown): string | null {
  if (typeof detail === 'string') {
    return detail
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map(getReadableError)
      .filter((message): message is string => Boolean(message))

    return messages.length > 0 ? messages.join(' ') : null
  }

  if (detail && typeof detail === 'object') {
    const messages = Object.values(detail as Record<string, unknown>)
      .map(getReadableError)
      .filter((message): message is string => Boolean(message))

    return messages.length > 0 ? messages.join(' ') : null
  }

  return null
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return (
      getReadableError(error.response?.data?.detail) ??
      getReadableError(error.response?.data) ??
      'Não foi possível criar a bolsa.'
    )
  }

  return 'Não foi possível criar a bolsa.'
}

function addValidationError(
  errors: ValidationErrors,
  field: string,
  message: string,
) {
  errors[field] = [...(errors[field] ?? []), message]
}

function hasValidationErrors(errors: ValidationErrors) {
  return Object.values(errors).some((messages) => messages.length > 0)
}

function buildValidationErrors(form: ScholarshipFormState) {
  const errors: ValidationErrors = {}
  const valuePerMonth = parseLocaleNumber(form.valuePerMonth)
  const durationInMonths = parseInteger(form.durationInMonths)
  const vacancies = parseInteger(form.vacancies)
  const minimumPeriod = parseInteger(form.minimumPeriod)
  const minimumIra = parseLocaleNumber(form.minimumIra)
  const filledLinks = form.links.filter(
    (link) => link.label.trim() || link.url.trim(),
  )
  const filledRequirements = form.requirements.filter(
    (requirement) =>
      requirement.title.trim() || requirement.description.trim(),
  )

  if (!form.title.trim()) {
    addValidationError(errors, 'title', 'Informe o título do edital.')
  }

  if (!form.description.trim()) {
    addValidationError(errors, 'description', 'Informe a descrição da bolsa.')
  }

  if (!form.activityDescription.trim()) {
    addValidationError(
      errors,
      'activityDescription',
      'Informe as responsabilidades do bolsista.',
    )
  }

  if (valuePerMonth <= 0) {
    addValidationError(
      errors,
      'valuePerMonth',
      'Informe um valor mensal maior que zero.',
    )
  }

  if (durationInMonths <= 0) {
    addValidationError(
      errors,
      'durationInMonths',
      'Informe uma duração maior que zero.',
    )
  }

  if (vacancies <= 0) {
    addValidationError(errors, 'vacancies', 'Informe pelo menos uma vaga.')
  }

  if (minimumPeriod <= 0) {
    addValidationError(errors, 'minimumPeriod', 'Informe o período mínimo.')
  }

  if (minimumIra < 0 || minimumIra > 10) {
    addValidationError(
      errors,
      'minimumIra',
      'Informe um IRA mínimo entre 0 e 10.',
    )
  }

  if (form.selectedTechnologyIds.length === 0) {
    addValidationError(
      errors,
      'technologies',
      'Selecione pelo menos uma área ou tecnologia.',
    )
  }

  filledRequirements.forEach((requirement, index) => {
    if (!requirement.title.trim() || !requirement.description.trim()) {
      addValidationError(
        errors,
        `requirement:${requirement.id}`,
        `Complete o requisito ${index + 1}.`,
      )
    }
  })

  form.phases.forEach((phase, index) => {
    if (phase.type === 'Other' && !phase.title.trim()) {
      addValidationError(
        errors,
        `phase:${phase.id}`,
        `Informe o título da etapa ${index + 1}.`,
      )
    }

    if (!phase.startDate || !phase.endDate) {
      addValidationError(
        errors,
        `phase:${phase.id}`,
        `Informe o início e o fim da etapa ${index + 1}.`,
      )
    } else if (compareDateInputs(phase.startDate, phase.endDate) > 0) {
      addValidationError(
        errors,
        `phase:${phase.id}`,
        `A etapa ${index + 1} termina antes de começar.`,
      )
    }
  })

  if (!form.phases.some((phase) => phase.type === 'Registration')) {
    addValidationError(
      errors,
      'phases',
      'O cronograma precisa ter uma etapa de inscrições.',
    )
  }

  filledLinks.forEach((link, index) => {
    if (!link.label.trim() || !link.url.trim()) {
      addValidationError(
        errors,
        `link:${link.id}`,
        `Complete o link ${index + 1}.`,
      )
    } else if (!isValidUrl(link.url.trim())) {
      addValidationError(
        errors,
        `link:${link.id}`,
        `Informe uma URL válida para o link ${index + 1}.`,
      )
    }
  })

  return errors
}

function toPreviewScholarship(
  form: ScholarshipFormState,
  technologies: ScholarshipTechnology[],
): Scholarship {
  const registrationPhase = getRegistrationPhase(form.phases)
  const now = new Date().toISOString()
  const selectedTechnologies = technologies.filter((technology) =>
    form.selectedTechnologyIds.includes(technology.id),
  )

  return {
    id: 'preview',
    title: form.title.trim() || 'Título do edital',
    description:
      form.description.trim() || 'Descrição breve do edital aparecerá aqui.',
    activityDescription: form.activityDescription.trim(),
    valuePerMonth: parseLocaleNumber(form.valuePerMonth),
    durationInMonths: parseInteger(form.durationInMonths),
    vacancies: parseInteger(form.vacancies),
    minimumPeriod: parseInteger(form.minimumPeriod),
    minimumIra: parseLocaleNumber(form.minimumIra),
    publishedBy: 'preview',
    status: form.status,
    phases: form.phases.map((phase, index) => ({
      id: phase.id,
      title:
        phase.type === 'Other'
          ? phase.title.trim() || phaseTypeLabels[phase.type]
          : phaseTypeLabels[phase.type],
      startDate: toDateTime(phase.startDate) ?? '',
      endDate: toDateTime(phase.endDate, true) ?? '',
      type: phase.type,
      displayOrder: index + 1,
    })),
    links: form.links
      .filter((link) => link.label.trim() && link.url.trim())
      .map((link, index) => ({
        id: link.id,
        label: link.label.trim() || `Link ${index + 1}`,
        url: link.url.trim(),
        displayOrder: index + 1,
      })),
    requirements: form.requirements
      .filter(
        (requirement) =>
          requirement.title.trim() || requirement.description.trim(),
      )
      .map((requirement, index) => ({
        id: requirement.id,
        title: requirement.title.trim() || `Requisito ${index + 1}`,
        description: requirement.description.trim(),
        displayOrder: index + 1,
      })),
    technologies: selectedTechnologies,
    userApplication: null,
    registrationEnd: registrationPhase
      ? toDateTime(registrationPhase.endDate, true)
      : null,
    createdAt: now,
    updatedAt: now,
  }
}

function FieldErrors({
  errors,
  field,
}: {
  errors: ValidationErrors
  field: string
}) {
  const messages = errors[field]

  if (!messages?.length) {
    return null
  }

  return (
    <div className="scholarship-create-field-errors" role="alert">
      {messages.map((message) => (
        <span key={message}>{message}</span>
      ))}
    </div>
  )
}

export default function CreateScholarshipPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeSection, setActiveSection] =
    useState<FormSection>('identification')
  const [form, setForm] = useState(getStoredFormState)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  )
  const [cancelConfirmationOpen, setCancelConfirmationOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<
    ScholarshipFormState['status'] | null
  >(null)

  const technologiesQuery = useQuery({
    queryKey: ['scholarships', 'technologies'],
    queryFn: listScholarshipTechnologies,
  })

  const availableTechnologies = technologiesQuery.data ?? emptyTechnologies
  const previewScholarship = useMemo(
    () => toPreviewScholarship(form, availableTechnologies),
    [availableTechnologies, form],
  )

  useEffect(() => {
    window.localStorage.setItem(draftStorageKey, JSON.stringify(form))
  }, [form])

  const createMutation = useMutation({
    mutationFn: async (submission: ScholarshipFormState) => {
      const payload = toCreatePayload(
        submission,
        submission.selectedTechnologyIds,
      )

      return createScholarship(payload)
    },
    onSuccess: (scholarship) => {
      window.localStorage.removeItem(draftStorageKey)
      queryClient.invalidateQueries({ queryKey: ['scholarships'] })
      navigate(`/bolsas/${scholarship.id}`)
    },
    onSettled: () => {
      setPendingStatus(null)
    },
  })

  function updateField<K extends keyof ScholarshipFormState>(
    field: K,
    value: ScholarshipFormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function updateRequirement(
    requirementId: string,
    field: keyof Omit<RequirementDraft, 'id'>,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      requirements: current.requirements.map((requirement) =>
        requirement.id === requirementId
          ? {
              ...requirement,
              [field]: value,
            }
          : requirement,
      ),
    }))
  }

  function addRequirement() {
    setForm((current) => ({
      ...current,
      requirements: [
        ...current.requirements,
        {
          id: createDraftId('requirement'),
          title: '',
          description: '',
        },
      ],
    }))
  }

  function removeRequirement(requirementId: string) {
    setForm((current) => ({
      ...current,
      requirements: current.requirements.filter(
        (requirement) => requirement.id !== requirementId,
      ),
    }))
  }

  function updatePhase(
    phaseId: string,
    field: keyof Omit<PhaseDraft, 'id'>,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      phases: current.phases.map((phase) =>
        phase.id === phaseId
          ? {
              ...phase,
              [field]: value,
            }
          : phase,
      ),
    }))
  }

  function updatePhaseType(phaseId: string, type: ScholarshipPhaseType) {
    setForm((current) => ({
      ...current,
      phases: current.phases.map((phase) =>
        phase.id === phaseId
          ? {
              ...phase,
              title: type === 'Other' ? phase.title : '',
              type,
            }
          : phase,
      ),
    }))
  }

  function addPhase() {
    setForm((current) => {
      const lastPhase = current.phases[current.phases.length - 1]
      const nextStart = lastPhase?.endDate
        ? formatDateInput(addDays(new Date(`${lastPhase.endDate}T00:00:00`), 1))
        : formatDateInput(new Date())

      return {
        ...current,
        phases: [
          ...current.phases,
          {
            id: createDraftId('phase'),
            title: '',
            startDate: nextStart,
            endDate: nextStart,
            type: 'Other',
          },
        ],
      }
    })
  }

  function removePhase(phaseId: string) {
    setForm((current) => ({
      ...current,
      phases: current.phases.filter((phase) => phase.id !== phaseId),
    }))
  }

  function updateLink(
    linkId: string,
    field: keyof Omit<LinkDraft, 'id'>,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      links: current.links.map((link) =>
        link.id === linkId
          ? {
              ...link,
              [field]: value,
            }
          : link,
      ),
    }))
  }

  function addLink() {
    setForm((current) => ({
      ...current,
      links: [
        ...current.links,
        {
          id: createDraftId('link'),
          label: '',
          url: '',
        },
      ],
    }))
  }

  function removeLink(linkId: string) {
    setForm((current) => ({
      ...current,
      links: current.links.filter((link) => link.id !== linkId),
    }))
  }

  function toggleTechnology(technologyId: string) {
    setForm((current) => ({
      ...current,
      selectedTechnologyIds: current.selectedTechnologyIds.includes(technologyId)
        ? current.selectedTechnologyIds.filter((id) => id !== technologyId)
        : [...current.selectedTechnologyIds, technologyId],
    }))
  }

  function handleStepClick(section: FormSection) {
    setActiveSection(section)
    document
      .getElementById(`scholarship-create-${section}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  function handleConfirmCancel() {
    window.localStorage.removeItem(draftStorageKey)
    navigate('/bolsas')
  }

  function submitScholarship(status: ScholarshipFormState['status']) {
    const submission = {
      ...form,
      status,
    }

    const errors = buildValidationErrors(submission)
    setValidationErrors(errors)

    if (hasValidationErrors(errors)) {
      return
    }

    setForm(submission)
    setPendingStatus(status)
    createMutation.mutate(submission)
  }

  function handleNumberChange(
    event: ChangeEvent<HTMLInputElement>,
    field:
      | 'durationInMonths'
      | 'minimumIra'
      | 'minimumPeriod'
      | 'vacancies'
      | 'valuePerMonth',
  ) {
    updateField(field, event.target.value)
  }

  return (
    <section className="scholarship-create-page">
      <form
        className="scholarship-create"
        id="create-scholarship-form"
        onSubmit={handleSubmit}
      >
        <header className="scholarship-create__header">
          <div>
            <span className="scholarship-create__eyebrow">Novo edital</span>
            <h1>Criar bolsa de P&amp;D</h1>
            <p>Preencha as informações do edital. O rascunho é salvo automaticamente.</p>
          </div>
        </header>

        <nav className="scholarship-create-steps" aria-label="Etapas do formulário">
          {formSteps.map((step, index) => (
            <button
              aria-current={activeSection === step.id ? 'step' : undefined}
              className="scholarship-create-steps__item"
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              type="button"
            >
              <span>{index + 1}</span>
              <strong>{step.label}</strong>
              <small>{step.description}</small>
            </button>
          ))}
        </nav>

        {createMutation.isError ? (
          <section className="scholarship-create-alert" role="alert">
            <strong>Não foi possível criar a bolsa.</strong>
            <p>{getErrorMessage(createMutation.error)}</p>
          </section>
        ) : null}

        <div className="scholarship-create__layout">
          <main className="scholarship-create__main">
            <section
              className="scholarship-create-panel"
              id="scholarship-create-identification"
            >
              <header className="scholarship-create-panel__header">
                <span>1</span>
                <h2>Identificação</h2>
              </header>

              <div className="scholarship-create-panel__body">
                <label className="scholarship-create-field scholarship-create-field--full">
                  <span>Título *</span>
                  <input
                    onChange={(event) =>
                      updateField('title', event.target.value)
                    }
                    placeholder="Ex: Sistema de Monitoramento com IoT e Machine Learning"
                    value={form.title}
                  />
                  <FieldErrors errors={validationErrors} field="title" />
                </label>

                <label className="scholarship-create-field scholarship-create-field--full">
                  <span>
                    Descrição *
                    <small>aparece no cabeçalho e tab Sobre </small>
                  </span>
                  <textarea
                    onChange={(event) =>
                      updateField('description', event.target.value)
                    }
                    placeholder="Detalhe a bolsa, o sistema que será implementado, etc."
                    rows={4}
                    value={form.description}
                  />
                  <FieldErrors errors={validationErrors} field="description" />
                </label>

                <label className="scholarship-create-field scholarship-create-field--full">
                  <span>
                    Atividades *
                    <small>responsabilidades do bolsista</small>
                  </span>
                  <textarea
                    onChange={(event) =>
                      updateField('activityDescription', event.target.value)
                    }
                    rows={7}
                    value={form.activityDescription}
                  />
                  <FieldErrors
                    errors={validationErrors}
                    field="activityDescription"
                  />
                </label>

                <div className="scholarship-create-field scholarship-create-field--full">
                  <span>Área / tecnologias *</span>
                  <div className="scholarship-create-tech-picker">
                    {technologiesQuery.isLoading ? (
                      <p>Carregando tecnologias cadastradas...</p>
                    ) : availableTechnologies.length === 0 ? (
                      <p>Nenhuma tecnologia cadastrada no serviço de bolsas.</p>
                    ) : (
                      availableTechnologies.map((technology) => {
                        const meta = getTechnologyMeta(technology.name)

                        return (
                          <button
                            aria-pressed={form.selectedTechnologyIds.includes(
                              technology.id,
                            )}
                            key={technology.id}
                            onClick={() => toggleTechnology(technology.id)}
                            type="button"
                          >
                            <TechTag
                              accentColor={
                                meta ? techIconColors[meta.icon] : undefined
                              }
                              category={meta?.category ?? 'tool'}
                              icon={
                                meta ? <TechIcon name={meta.icon} /> : undefined
                              }
                              variant="solid"
                            >
                              {technology.name}
                            </TechTag>
                          </button>
                        )
                      })
                    )}
                  </div>
                  <FieldErrors errors={validationErrors} field="technologies" />
                </div>
              </div>
            </section>

            <section
              className="scholarship-create-panel"
              id="scholarship-create-details"
            >
              <header className="scholarship-create-panel__header">
                <span>2</span>
                <h2>Vagas, valores e requisitos</h2>
              </header>

              <div className="scholarship-create-panel__body scholarship-create-panel__body--grid">
                <label className="scholarship-create-field">
                  <span>Vagas *</span>
                  <input
                    min="1"
                    onChange={(event) => handleNumberChange(event, 'vacancies')}
                    type="number"
                    value={form.vacancies}
                  />
                  <FieldErrors errors={validationErrors} field="vacancies" />
                </label>

                <label className="scholarship-create-field">
                  <span>Valor mensal (R$) *</span>
                  <input
                    min="0"
                    onChange={(event) =>
                      handleNumberChange(event, 'valuePerMonth')
                    }
                    step="0.01"
                    type="number"
                    value={form.valuePerMonth}
                  />
                  <FieldErrors
                    errors={validationErrors}
                    field="valuePerMonth"
                  />
                </label>

                <label className="scholarship-create-field">
                  <span>Duração (meses) *</span>
                  <input
                    min="1"
                    onChange={(event) =>
                      handleNumberChange(event, 'durationInMonths')
                    }
                    type="number"
                    value={form.durationInMonths}
                  />
                  <FieldErrors
                    errors={validationErrors}
                    field="durationInMonths"
                  />
                </label>

                <label className="scholarship-create-field">
                  <span>IRA mínimo *</span>
                  <input
                    max="10"
                    min="0"
                    onChange={(event) =>
                      handleNumberChange(event, 'minimumIra')
                    }
                    step="0.1"
                    type="number"
                    value={form.minimumIra}
                  />
                  <FieldErrors errors={validationErrors} field="minimumIra" />
                </label>

                <label className="scholarship-create-field">
                  <span>Período mínimo *</span>
                  <select
                    onChange={(event) =>
                      updateField('minimumPeriod', event.target.value)
                    }
                    value={form.minimumPeriod}
                  >
                    {Array.from({ length: 7 }, (_, index) => index + 1).map(
                      (period) => (
                        <option key={period} value={period}>
                          {period}º semestre ou mais
                        </option>
                      ),
                    )}
                  </select>
                  <ChevronDown aria-hidden="true" size={17} strokeWidth={1.9} />
                  <FieldErrors
                    errors={validationErrors}
                    field="minimumPeriod"
                  />
                </label>

                <div className="scholarship-create-field scholarship-create-field--full">
                  <span>Requisitos técnicos</span>
                  <div className="scholarship-create-requirements">
                    <div
                      className="scholarship-create-structured-labels scholarship-create-structured-labels--requirements"
                      aria-hidden="true"
                    >
                      <span>Requisito</span>
                      <span>Descrição</span>
                    </div>

                    {form.requirements.map((requirement, index) => (
                      <article
                        className="scholarship-create-structured-row scholarship-create-structured-row--requirements"
                        key={requirement.id}
                      >
                        <span className="scholarship-create-row-number">
                          {index + 1}
                        </span>
                        <input
                          onChange={(event) =>
                            updateRequirement(
                              requirement.id,
                              'title',
                              event.target.value,
                            )
                          }
                          placeholder="Python intermediário"
                          value={requirement.title}
                        />
                        <textarea
                          onChange={(event) =>
                            updateRequirement(
                              requirement.id,
                              'description',
                              event.target.value,
                            )
                          }
                          placeholder="Capaz de manipular APIs REST e estruturas de dados."
                          rows={1}
                          value={requirement.description}
                        />
                        <Button
                          aria-label="Remover requisito"
                          iconLeft={Trash2}
                          onClick={() => removeRequirement(requirement.id)}
                          variant="ghost"
                        />
                        <FieldErrors
                          errors={validationErrors}
                          field={`requirement:${requirement.id}`}
                        />
                      </article>
                    ))}
                  </div>
                  <Button
                    className="scholarship-create-add-button"
                    iconLeft={Plus}
                    onClick={addRequirement}
                    size="sm"
                    variant="outline"
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
            </section>

            <section
              className="scholarship-create-panel"
              id="scholarship-create-schedule"
            >
              <header className="scholarship-create-panel__header">
                <span>3</span>
                <h2>Cronograma do processo seletivo</h2>
              </header>

              <div className="scholarship-create-panel__body">
                <p className="scholarship-create-panel__hint">
                  Defina cada etapa com seu título e intervalo de datas.
                </p>

                <div className="scholarship-create-schedule">
                  <div className="scholarship-create-schedule__labels" aria-hidden="true">
                    <span>Tipo</span>
                    <span>Título</span>
                    <span>Início do prazo</span>
                    <span>Fim do prazo</span>
                  </div>

                  {form.phases.map((phase, index) => (
                    <article
                      className="scholarship-create-schedule-row"
                      key={phase.id}
                    >
                      <span className="scholarship-create-schedule-row__number">
                        {index + 1}
                      </span>
                      <label>
                        <select
                          onChange={(event) =>
                            updatePhaseType(
                              phase.id,
                              event.target.value as ScholarshipPhaseType,
                            )
                          }
                          value={phase.type}
                        >
                          {Object.entries(phaseTypeLabels).map(
                            ([type, label]) => (
                              <option key={type} value={type}>
                                {label}
                              </option>
                            ),
                          )}
                        </select>
                        <ChevronDown
                          aria-hidden="true"
                          size={16}
                          strokeWidth={1.9}
                        />
                      </label>
                      {phase.type === 'Other' ? (
                        <input
                          onChange={(event) =>
                            updatePhase(phase.id, 'title', event.target.value)
                          }
                          placeholder="Título da etapa"
                          value={phase.title}
                        />
                      ) : (
                        <span className="scholarship-create-phase-label">
                          {phaseTypeLabels[phase.type]}
                        </span>
                      )}
                      <input
                        onChange={(event) =>
                          updatePhase(phase.id, 'startDate', event.target.value)
                        }
                        type="date"
                        value={phase.startDate}
                      />
                      <input
                        onChange={(event) =>
                          updatePhase(phase.id, 'endDate', event.target.value)
                        }
                        type="date"
                        value={phase.endDate}
                      />
                      <Button
                        aria-label="Remover etapa"
                        disabled={phase.id === registrationPhaseId}
                        iconLeft={Trash2}
                        onClick={() => removePhase(phase.id)}
                        variant="ghost"
                      />
                      <FieldErrors
                        errors={validationErrors}
                        field={`phase:${phase.id}`}
                      />
                    </article>
                  ))}
                </div>

                <FieldErrors errors={validationErrors} field="phases" />

                <Button
                  className="scholarship-create-add-button"
                  iconLeft={Plus}
                  onClick={addPhase}
                  size="sm"
                  variant="outline"
                >
                  Adicionar
                </Button>
              </div>
            </section>

            <section
              className="scholarship-create-panel"
              id="scholarship-create-publish"
            >
              <header className="scholarship-create-panel__header">
                <span>4</span>
                <h2>Links relacionados à bolsa</h2>
              </header>

              <div className="scholarship-create-panel__body">
                <div className="scholarship-create-field scholarship-create-field--full">
                  <div className="scholarship-create-links">
                    <div
                      className="scholarship-create-structured-labels scholarship-create-structured-labels--links"
                      aria-hidden="true"
                    >
                      <span>Nome</span>
                      <span>URL</span>
                    </div>

                    {form.links.map((link, index) => (
                      <article
                        className="scholarship-create-structured-row scholarship-create-structured-row--links"
                        key={link.id}
                      >
                        <span className="scholarship-create-row-number">
                          {index + 1}
                        </span>
                        <input
                          onChange={(event) =>
                            updateLink(link.id, 'label', event.target.value)
                          }
                          placeholder="Edital"
                          value={link.label}
                        />
                        <input
                          onChange={(event) =>
                            updateLink(link.id, 'url', event.target.value)
                          }
                          placeholder="https://..."
                          type="url"
                          value={link.url}
                        />
                        <Button
                          aria-label="Remover link"
                          iconLeft={Trash2}
                          onClick={() => removeLink(link.id)}
                          variant="ghost"
                        />
                        <FieldErrors
                          errors={validationErrors}
                          field={`link:${link.id}`}
                        />
                      </article>
                    ))}
                  </div>

                  <Button
                    className="scholarship-create-add-button"
                    iconLeft={Plus}
                    onClick={addLink}
                    size="sm"
                    variant="outline"
                  >
                    Adicionar
                  </Button>
                </div>

                <footer className="scholarship-create-submit">
                  <Button
                    onClick={() => setCancelConfirmationOpen(true)}
                    variant="danger"
                  >
                    Cancelar
                  </Button>
                  <Button
                    disabled={createMutation.isPending}
                    loading={
                      createMutation.isPending && pendingStatus === 'Draft'
                    }
                    onClick={() => submitScholarship('Draft')}
                    variant="outline"
                  >
                    Salvar rascunho
                  </Button>
                  <Button
                    disabled={createMutation.isPending}
                    loading={
                      createMutation.isPending && pendingStatus === 'Open'
                    }
                    onClick={() => submitScholarship('Open')}
                  >
                    Publicar
                  </Button>
                </footer>
              </div>
            </section>
          </main>

          <aside className="scholarship-create-preview" aria-label="Pré-visualização">
            <div className="scholarship-create-preview__header">
              <span>Pré-visualização</span>
            </div>

            <ScholarshipCard
              className="scholarship-create-preview__card"
              interactive={false}
              scholarship={previewScholarship}
            />
          </aside>
        </div>
      </form>

      {cancelConfirmationOpen ? (
        <div className="scholarship-create-cancel-modal" role="presentation">
          <section
            aria-describedby="cancel-scholarship-description"
            aria-labelledby="cancel-scholarship-title"
            aria-modal="true"
            className="scholarship-create-cancel-modal__dialog"
            role="alertdialog"
          >
            <div className="scholarship-create-cancel-modal__content">
              <h2 id="cancel-scholarship-title">Cancelar criação?</h2>
              <p id="cancel-scholarship-description">
                O rascunho local desta bolsa será descartado e você voltará para
                a listagem.
              </p>
            </div>

            <div className="scholarship-create-cancel-modal__actions">
              <Button
                onClick={() => setCancelConfirmationOpen(false)}
                variant="outline"
              >
                Continuar editando
              </Button>
              <Button onClick={handleConfirmCancel} variant="danger">
                Descartar e sair
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  )
}

function toCreatePayload(
  form: ScholarshipFormState,
  technologyIds: string[],
): CreateScholarshipInput {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    activityDescription: form.activityDescription.trim(),
    valuePerMonth: parseLocaleNumber(form.valuePerMonth),
    durationInMonths: parseInteger(form.durationInMonths),
    vacancies: parseInteger(form.vacancies),
    minimumPeriod: parseInteger(form.minimumPeriod),
    minimumIra: parseLocaleNumber(form.minimumIra),
    status: form.status,
    technologyIds,
    phases: form.phases.map((phase, index) => ({
      title: phase.type === 'Other' ? phase.title.trim() || null : null,
      startDate: toDateTime(phase.startDate) ?? '',
      endDate: toDateTime(phase.endDate, true) ?? '',
      type: phase.type,
      displayOrder: index + 1,
    })),
    links: form.links
      .filter((link) => link.label.trim() && link.url.trim())
      .map((link, index) => ({
        label: link.label.trim(),
        url: link.url.trim(),
        displayOrder: index + 1,
      })),
    requirements: form.requirements
      .filter(
        (requirement) =>
          requirement.title.trim() || requirement.description.trim(),
      )
      .map((requirement, index) => ({
        title: requirement.title.trim(),
        description: requirement.description.trim(),
        displayOrder: index + 1,
      })),
  }
}
