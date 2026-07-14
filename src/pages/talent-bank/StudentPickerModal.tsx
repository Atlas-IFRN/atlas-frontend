import { useQuery } from '@tanstack/react-query'
import { useEffect, useId, useMemo, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { SearchX, X } from 'lucide-react'
import type { AuthUser } from '../../contexts/AuthContext'
import {
  getCourseCategory,
  getCourseLabel,
  type CourseCategory,
} from '../../lib/course-label'
import { getActiveTalentStudents } from '../../services/talentBank'
import { Button } from '../../components/atoms/Button'
import { FilterTag } from '../../components/atoms/FilterTag'
import { SearchInput } from '../../components/atoms/SearchInput'
import { UserChip } from '../../components/molecules/UserChip'
import { EmptyState, ErrorState, LoadingState } from '../../components/states'

type StudentFilter = 'all' | Exclude<CourseCategory, 'other'>

interface StudentPickerModalProps {
  onClose: () => void
  onSelect: (student: AuthUser) => void
}

const STUDENT_FILTERS: Array<{ id: StudentFilter; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'ads', label: 'ADS' },
  { id: 'informatica', label: 'Informática' },
]

function normalizeSearchValue(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
}

function studentDetails(student: AuthUser) {
  return [
    student.matricula,
    student.courseName ? getCourseLabel(student.courseName) : null,
    student.period !== null ? `${student.period}º período` : null,
  ]
    .filter((detail): detail is string => Boolean(detail))
    .join(' · ')
}

export function StudentPickerModal({
  onClose,
  onSelect,
}: StudentPickerModalProps) {
  const titleId = useId()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<StudentFilter>('all')
  const studentsQuery = useQuery({
    queryKey: ['talent-bank', 'active-students'],
    queryFn: getActiveTalentStudents,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocusedElement?.focus()
    }
  }, [onClose])

  const filteredStudents = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query.trim())
    const students = studentsQuery.data ?? []

    return students.filter((student) => {
      const matchesFilter =
        filter === 'all' || getCourseCategory(student.courseName) === filter

      if (!matchesFilter) {
        return false
      }

      if (!normalizedQuery) {
        return true
      }

      const searchableText = normalizeSearchValue(
        [
          student.fullName,
          student.firstName,
          student.matricula,
          student.courseName,
          getCourseLabel(student.courseName),
        ].join(' '),
      )

      return searchableText.includes(normalizedQuery)
    })
  }, [filter, query, studentsQuery.data])

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return createPortal(
    <div
      className="student-picker-modal"
      onMouseDown={handleBackdropClick}
      role="presentation"
    >
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="student-picker-modal__dialog"
        role="dialog"
      >
        <header className="student-picker-modal__header">
          <h2 id={titleId}>Nova nota</h2>
          <Button
            aria-label="Fechar seleção de aluno"
            iconLeft={X}
            onClick={onClose}
            size="sm"
            variant="ghost"
          />
        </header>

        <div className="student-picker-modal__controls">
          <label htmlFor="student-picker-search">Buscar aluno</label>
          <SearchInput
            autoFocus
            id="student-picker-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nome ou matrícula..."
            value={query}
          />
          <div
            aria-label="Filtrar alunos por curso"
            className="student-picker-modal__filters"
            role="group"
          >
            {STUDENT_FILTERS.map((studentFilter) => (
              <FilterTag
                active={filter === studentFilter.id}
                key={studentFilter.id}
                label={studentFilter.label}
                onClick={() => setFilter(studentFilter.id)}
              />
            ))}
          </div>
        </div>

        <div
          aria-label="Alunos disponíveis"
          className="student-picker-modal__list"
        >
          {studentsQuery.isLoading ? (
            <LoadingState
              className="student-picker-modal__state"
              message="Carregando alunos..."
              variant="spinner"
            />
          ) : studentsQuery.isError ? (
            <ErrorState
              className="student-picker-modal__state"
              message="Não foi possível carregar os alunos agora."
              onRetry={() => void studentsQuery.refetch()}
            />
          ) : filteredStudents.length === 0 ? (
            <EmptyState
              className="student-picker-modal__state"
              description="Tente outro nome, matrícula ou filtro de curso."
              icon={SearchX}
              title="Nenhum aluno encontrado"
            />
          ) : (
            filteredStudents.map((student) => {
              const studentName = student.fullName || student.firstName

              return (
                <button
                  aria-label={`Criar nota para ${studentName}`}
                  className="student-picker-modal__student"
                  key={student.id}
                  onClick={() => onSelect(student)}
                  type="button"
                >
                  <UserChip
                    name={studentName}
                    role={studentDetails(student)}
                    size="md"
                    src={student.image || undefined}
                  />
                </button>
              )
            })
          )}
        </div>
      </section>
    </div>,
    document.body,
  )
}
