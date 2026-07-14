import { useQuery } from '@tanstack/react-query'
import { Plus, SearchX } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/atoms/Button'
import { FilterTag } from '../../components/atoms/FilterTag'
import { SearchInput } from '../../components/atoms/SearchInput'
import { TextTag } from '../../components/atoms/TextTag'
import {
  StudentNotesModal,
  type StudentNotesModalNote,
} from '../../components/perfil/StudentNotesModal'
import { PageHeroCopy } from '../../components/molecules/PageHeroCopy'
import { UserChip } from '../../components/molecules/UserChip'
import { EmptyState, ErrorState, LoadingState } from '../../components/states'
import type { AuthUser } from '../../contexts/AuthContext'
import {
  getCourseCategory,
  getCourseLabel,
  type CourseCategory,
} from '../../lib/course-label'
import type { NoteTag } from '../../lib/notas-mock'
import { getUserProfileById } from '../../services/auth'
import {
  getStudentNotes,
  type NoteSkillTag,
  type StudentNote,
} from '../../services/notes'
import { CreateNoteModal } from './CreateNoteModal'
import { StudentPickerModal } from './StudentPickerModal'
import './NotesPage.css'

interface NotesPageProps {
  createNoteReturnTo?: string
  createNoteStudentId?: string
}

interface NotesDirectory {
  notes: StudentNote[]
  profilesById: Map<string, AuthUser>
}

interface StudentNotesGroup {
  latestNote: StudentNote
  notes: StudentNote[]
  skillCounts: Record<NoteSkillTag, number>
  student: AuthUser
  studentId: string
}

type NotesFilter = NoteSkillTag | CourseCategory

const DIRECTORY_FILTERS: Array<{ id: NotesFilter; label: string }> = [
  { id: 'SOFT_SKILL', label: 'Soft Skill' },
  { id: 'HARD_SKILL', label: 'Hard Skill' },
  { id: 'ads', label: 'ADS' },
  { id: 'informatica', label: 'Informática' },
  { id: 'other', label: 'Outros cursos' },
]

const SKILL_TAGS: Array<{
  id: NoteSkillTag
  label: string
  variant: NoteTag
}> = [
  { id: 'SOFT_SKILL', label: 'Soft Skill', variant: 'soft-skill' },
  { id: 'HARD_SKILL', label: 'Hard Skill', variant: 'hard-skill' },
]

const DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})
const TIME_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  hour12: false,
  minute: '2-digit',
})

async function getNotesDirectory(): Promise<NotesDirectory> {
  const notes = await getStudentNotes()
  const profileIds = [
    ...new Set(
      notes.flatMap((note) => [note.studentId, note.professorId]),
    ),
  ].filter(Boolean)
  const profileResults = await Promise.allSettled(
    profileIds.map(async (profileId) => ({
      profile: await getUserProfileById(profileId),
      profileId,
    })),
  )
  const profilesById = new Map<string, AuthUser>()

  profileResults.forEach((result) => {
    if (result.status === 'fulfilled') {
      profilesById.set(result.value.profileId, result.value.profile)
    }
  })

  if (
    notes.length > 0 &&
    !notes.some((note) => profilesById.has(note.studentId))
  ) {
    throw new Error('Não foi possível carregar os perfis dos alunos.')
  }

  return { notes, profilesById }
}

function normalizeSearchValue(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
}

function formatDateTime(value: string, separator = ' · ') {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'data indisponível'
  }

  const formattedDate = DATE_FORMATTER.format(date).replace(/\./g, '')
  return `${formattedDate}${separator}${TIME_FORMATTER.format(date)}`
}

function noteCountLabel(count: number) {
  return `${count} ${count === 1 ? 'nota' : 'notas'}`
}

function studentDetails(student: AuthUser) {
  return [
    student.courseName ? getCourseLabel(student.courseName) : null,
    student.period !== null ? `${student.period}º período` : null,
  ]
    .filter((detail): detail is string => Boolean(detail))
    .join(' · ')
}

function toModalTag(tag: NoteSkillTag): NoteTag {
  return tag === 'SOFT_SKILL' ? 'soft-skill' : 'hard-skill'
}

function toModalNotes(
  notes: StudentNote[],
  profilesById: Map<string, AuthUser>,
): StudentNotesModalNote[] {
  return notes.map((note) => {
    const professor = profilesById.get(note.professorId)

    return {
      content: note.content,
      createdAt: formatDateTime(note.createdAt, ', '),
      dateTime: note.createdAt,
      id: note.id,
      professor: {
        avatarSrc: professor?.image || undefined,
        name:
          professor?.fullName ||
          professor?.firstName ||
          'Não identificado',
      },
      tags: note.tags.map(toModalTag),
    }
  })
}

function buildStudentGroups(directory: NotesDirectory): StudentNotesGroup[] {
  const notesByStudent = new Map<string, StudentNote[]>()

  directory.notes.forEach((note) => {
    const currentNotes = notesByStudent.get(note.studentId) ?? []
    currentNotes.push(note)
    notesByStudent.set(note.studentId, currentNotes)
  })

  return [...notesByStudent.entries()]
    .flatMap(([studentId, notes]) => {
      const student = directory.profilesById.get(studentId)

      if (!student) {
        return []
      }

      const sortedNotes = [...notes].sort(
        (first, second) =>
          Date.parse(second.createdAt) - Date.parse(first.createdAt),
      )

      return [
        {
          latestNote: sortedNotes[0],
          notes: sortedNotes,
          skillCounts: {
            HARD_SKILL: sortedNotes.filter((note) =>
              note.tags.includes('HARD_SKILL'),
            ).length,
            SOFT_SKILL: sortedNotes.filter((note) =>
              note.tags.includes('SOFT_SKILL'),
            ).length,
          },
          student,
          studentId,
        },
      ]
    })
    .sort(
      (first, second) =>
        Date.parse(second.latestNote.createdAt) -
        Date.parse(first.latestNote.createdAt),
    )
}

export default function NotesPage({
  createNoteReturnTo = '/professor/notas',
  createNoteStudentId,
}: NotesPageProps) {
  const navigate = useNavigate()
  const [isStudentPickerOpen, setIsStudentPickerOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<NotesFilter | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  )
  const directoryQuery = useQuery({
    queryKey: ['notes', 'directory'],
    queryFn: getNotesDirectory,
    staleTime: 60 * 1000,
  })
  const groups = useMemo(
    () => (directoryQuery.data ? buildStudentGroups(directoryQuery.data) : []),
    [directoryQuery.data],
  )
  const filteredGroups = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query.trim())
    const skillFilter: NoteSkillTag | null =
      selectedFilter === 'SOFT_SKILL' || selectedFilter === 'HARD_SKILL'
        ? selectedFilter
        : null
    const courseFilter: CourseCategory | null =
      selectedFilter === 'ads' ||
      selectedFilter === 'informatica' ||
      selectedFilter === 'other'
        ? selectedFilter
        : null

    return groups.filter((group) => {
      const matchesSkills =
        skillFilter === null || group.skillCounts[skillFilter] > 0
      const courseCategory = getCourseCategory(group.student.courseName)
      const matchesCourse =
        courseFilter === null || courseFilter === courseCategory

      if (!matchesSkills || !matchesCourse) {
        return false
      }

      if (!normalizedQuery) {
        return true
      }

      const searchableText = normalizeSearchValue(
        [
          group.student.fullName,
          group.student.firstName,
          group.student.matricula,
          group.student.courseName,
          getCourseLabel(group.student.courseName),
          ...group.notes.map((note) => note.content),
        ].join(' '),
      )

      return searchableText.includes(normalizedQuery)
    })
  }, [groups, query, selectedFilter])
  const selectedGroup = groups.find(
    (group) => group.studentId === selectedStudentId,
  )

  const closeCreateNote = useCallback(() => {
    navigate(createNoteReturnTo)
  }, [createNoteReturnTo, navigate])

  const closeStudentPicker = useCallback(() => {
    setIsStudentPickerOpen(false)
  }, [])

  const openStudentPicker = useCallback(() => {
    setIsStudentPickerOpen(true)
  }, [])

  const selectStudent = useCallback(
    (student: AuthUser) => {
      setIsStudentPickerOpen(false)
      navigate(
        `/banco-talentos/${encodeURIComponent(student.id)}/notas/nova`,
        { state: { returnTo: createNoteReturnTo } },
      )
    },
    [createNoteReturnTo, navigate],
  )

  function toggleFilter(filter: NotesFilter) {
    setSelectedFilter((currentFilter) =>
      currentFilter === filter ? null : filter,
    )
  }

  return (
    <main className="professor-notes-page" aria-labelledby="notes-page-title">
      <header className="professor-notes-page__header">
        <PageHeroCopy
          description="Registre observações sobre desempenho, conhecimentos e habilidades de cada aluno."
          eyebrow="NADIC · Professor"
          title="Notas sobre alunos"
          titleId="notes-page-title"
        />
        <Button
          className="professor-notes-page__create-button"
          iconLeft={Plus}
          onClick={openStudentPicker}
        >
          Nova nota
        </Button>
      </header>

      <section
        aria-label="Busca e filtros de alunos"
        className="professor-notes-page__controls"
      >
        <SearchInput
          aria-label="Buscar por aluno ou conteúdo da nota"
          className="professor-notes-page__search"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por aluno ou conteúdo da nota..."
          value={query}
        />
        <div
          aria-label="Filtrar alunos com notas"
          className="professor-notes-page__filters"
          role="group"
        >
          <FilterTag
            active={selectedFilter === null}
            label="Todos"
            onClick={() => setSelectedFilter(null)}
          />
          {DIRECTORY_FILTERS.map((filter) => (
            <FilterTag
              active={selectedFilter === filter.id}
              key={filter.id}
              label={filter.label}
              onClick={() => toggleFilter(filter.id)}
            />
          ))}
        </div>
      </section>

      <section
        aria-label="Alunos com notas"
        className="professor-notes-page__directory"
      >
        {directoryQuery.isLoading ? (
          <LoadingState
            className="professor-notes-page__loading"
            skeletonCount={6}
          />
        ) : directoryQuery.isError ? (
          <ErrorState
            className="professor-notes-page__state"
            message="Não foi possível carregar as notas dos alunos agora."
            onRetry={() => void directoryQuery.refetch()}
          />
        ) : groups.length === 0 ? (
          <EmptyState
            actionLabel="Criar primeira nota"
            className="professor-notes-page__state"
            description="Quando uma nota for registrada, o aluno aparecerá nesta listagem."
            onAction={openStudentPicker}
            title="Nenhum aluno com notas"
          />
        ) : filteredGroups.length === 0 ? (
          <EmptyState
            className="professor-notes-page__state"
            description="Tente outro nome, conteúdo ou combinação de filtros."
            icon={SearchX}
            title="Nenhum aluno encontrado"
          />
        ) : (
          <div className="student-note-directory" role="list">
            {filteredGroups.map((group) => {
              const studentName =
                group.student.fullName || group.student.firstName

              return (
                <div
                  className="student-note-directory__item"
                  key={group.studentId}
                  role="listitem"
                >
                  <button
                    aria-label={`Ver ${noteCountLabel(group.notes.length)} de ${studentName}`}
                    className="student-note-directory__card"
                    onClick={() => setSelectedStudentId(group.studentId)}
                    type="button"
                  >
                    <UserChip
                      className="student-note-directory__student"
                      name={studentName}
                      role={studentDetails(group.student)}
                      size="md"
                      src={group.student.image || undefined}
                    />

                    <div className="student-note-directory__tags">
                      {SKILL_TAGS.map((tag) =>
                        group.skillCounts[tag.id] > 0 ? (
                          <TextTag
                            key={tag.id}
                            size="sm"
                            variant={tag.variant}
                          >
                            {tag.label} ×{group.skillCounts[tag.id]}
                          </TextTag>
                        ) : null,
                      )}
                    </div>

                    <footer className="student-note-directory__footer">
                      <span>
                        {noteCountLabel(group.notes.length)} · última{' '}
                        {formatDateTime(group.latestNote.createdAt)}
                      </span>
                      <strong>Ver todas →</strong>
                    </footer>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {selectedGroup && directoryQuery.data ? (
        <StudentNotesModal
          notes={toModalNotes(
            selectedGroup.notes,
            directoryQuery.data.profilesById,
          )}
          onClose={() => setSelectedStudentId(null)}
          returnTo="/professor/notas"
          student={selectedGroup.student}
        />
      ) : null}

      {createNoteStudentId ? (
        <CreateNoteModal
          isCovered={isStudentPickerOpen}
          key={createNoteStudentId}
          onChangeStudent={openStudentPicker}
          onClose={closeCreateNote}
          onSaved={closeCreateNote}
          studentId={createNoteStudentId}
        />
      ) : null}

      {isStudentPickerOpen ? (
        <StudentPickerModal
          onClose={closeStudentPicker}
          onSelect={selectStudent}
        />
      ) : null}
    </main>
  )
}
