import {
  AlertCircle,
  GraduationCap,
  SearchX,
  UserPlus,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Avatar } from '../../components/atoms/Avatar'
import { Button } from '../../components/atoms/Button'
import { ButtonLink } from '../../components/atoms/ButtonLink'
import { FilterTag } from '../../components/atoms/FilterTag'
import { SearchInput } from '../../components/atoms/SearchInput'
import { StatCard } from '../../components/atoms/StatCard'
import { TextTag } from '../../components/atoms/TextTag'
import { PageHeroCopy } from '../../components/molecules/PageHeroCopy'
import { EmptyState, ErrorState, LoadingState } from '../../components/states'
import { useTalentBankDirectory } from '../../hooks/useTalentBank'
import { getCourseCategory, getCourseLabel } from '../../lib/course-label'
import type { TalentBankStudent } from '../../services/talentBank'
import { CreateNoteModal } from './CreateNoteModal'
import './TeacherTalentBankView.css'

type TalentFilter =
  'all' | 'backend' | 'frontend' | 'ads' | 'informatica' | 'other' | 'completed'

const TALENT_FILTERS: Array<{ id: TalentFilter; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'backend', label: 'Backend' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'ads', label: 'ADS' },
  { id: 'informatica', label: 'Informática' },
  { id: 'other', label: 'Outros cursos' },
  { id: 'completed', label: 'Com trilhas concluídas' },
]

const TRACK_AREA_TERMS: Record<'backend' | 'frontend', string[]> = {
  backend: [
    'back end',
    'backend',
    'api',
    'banco de dados',
    'django',
    'express',
    'fastapi',
    'flask',
    'java',
    'laravel',
    'nestjs',
    'node',
    'php',
    'postgresql',
    'python',
    'spring',
    'sql',
  ],
  frontend: [
    'angular',
    'css',
    'front end',
    'frontend',
    'html',
    'interface',
    'javascript',
    'react',
    'typescript',
    'ui',
    'ux',
    'vue',
  ],
}

function normalizeSearchValue(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
}

function matchesTrackArea(
  entry: TalentBankStudent,
  area: 'backend' | 'frontend',
) {
  return Boolean(
    entry.completedTracks?.some((track) => {
      const normalizedTitle = normalizeSearchValue(track.title).replace(
        /[^a-z0-9]+/g,
        ' ',
      )
      const paddedTitle = ` ${normalizedTitle.replace(/\s+/g, ' ').trim()} `

      return TRACK_AREA_TERMS[area].some((term) =>
        paddedTitle.includes(` ${term} `),
      )
    }),
  )
}

function matchesFilter(entry: TalentBankStudent, filter: TalentFilter) {
  if (filter === 'all') {
    return true
  }

  if (filter === 'backend' || filter === 'frontend') {
    return matchesTrackArea(entry, filter)
  }

  if (filter === 'completed') {
    return Boolean(entry.completedTracks?.length)
  }

  return getCourseCategory(entry.student.courseName) === filter
}

function matchesSearch(entry: TalentBankStudent, query: string) {
  const normalizedQuery = normalizeSearchValue(query.trim())

  if (!normalizedQuery) {
    return true
  }

  const searchableText = normalizeSearchValue(
    [
      entry.student.fullName,
      entry.student.firstName,
      entry.student.matricula,
      entry.student.courseName,
      getCourseLabel(entry.student.courseName),
      entry.student.institutionName,
      ...(entry.completedTracks?.map((track) => track.title) ?? []),
    ].join(' '),
  )

  return searchableText.includes(normalizedQuery)
}

function startOfCurrentWeek(referenceDate = new Date()) {
  const start = new Date(referenceDate)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  return start
}

function useCurrentWeekStart() {
  const [weekStart, setWeekStart] = useState(() =>
    startOfCurrentWeek().getTime(),
  )

  useEffect(() => {
    const nextWeek = new Date(weekStart)
    nextWeek.setDate(nextWeek.getDate() + 7)
    const delay = Math.max(1_000, nextWeek.getTime() - Date.now() + 1_000)
    const timeoutId = window.setTimeout(
      () => setWeekStart(startOfCurrentWeek().getTime()),
      delay,
    )

    return () => window.clearTimeout(timeoutId)
  }, [weekStart])

  return weekStart
}

function countCurrentWeekEntries(
  entries: Array<{ joinedAt: string }>,
  weekStart: number,
) {
  const now = Date.now()

  return entries.filter((entry) => {
    const joinedAt = Date.parse(entry.joinedAt)
    return Number.isFinite(joinedAt) && joinedAt >= weekStart && joinedAt <= now
  }).length
}

function formatIra(value: number | null) {
  return value === null ? '—' : value.toFixed(2)
}

function formatAverageIra(entries: TalentBankStudent[]) {
  const iraValues = entries.flatMap(({ student }) =>
    student.ira === null ? [] : [student.ira],
  )

  if (iraValues.length === 0) {
    return '—'
  }

  const total = iraValues.reduce((sum, ira) => sum + ira, 0)
  return (total / iraValues.length).toFixed(2)
}

function formatJoinedAt(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Data de inscrição indisponível'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
    .format(date)
    .replace(/\./g, '')
    .replace(/ de /g, ' ')
}

function studentAcademicDetails(entry: TalentBankStudent) {
  const course = entry.student.courseName
    ? getCourseLabel(entry.student.courseName)
    : 'Curso não informado'
  const period =
    entry.student.period === null
      ? 'Período não informado'
      : `${entry.student.period}º período`

  return `${course} · ${period}`
}

function TalentStudentCard({
  entry,
  onWriteNote,
}: {
  entry: TalentBankStudent
  onWriteNote: (studentId: string) => void
}) {
  const { registration, student } = entry
  const studentName = student.fullName || student.firstName || 'Aluno'
  const studentId = student.id || registration.studentId
  const profileLookup = student.matricula || studentId

  return (
    <article className="teacher-talent-card">
      <div className="teacher-talent-card__identity">
        <Avatar
          className="teacher-talent-card__avatar"
          name={studentName}
          size="lg"
          src={student.image || undefined}
        />

        <div className="teacher-talent-card__student-copy">
          <h3>{studentName}</h3>
          <p>{studentAcademicDetails(entry)}</p>
          <span>Matrícula {student.matricula || 'não informada'} ·</span>
          <span>Inscrito em {formatJoinedAt(registration.joinedAt)}</span>
        </div>
      </div>

      <div className="teacher-talent-card__ira">
        <span>IRA acadêmico</span>
        <strong>{formatIra(student.ira)}</strong>
      </div>

      <div className="teacher-talent-card__tracks">
        <span className="teacher-talent-card__section-label">
          Skills &amp; interesses
        </span>

        {entry.completedTracks === null ? (
          <p role="status">Trilhas indisponíveis no momento.</p>
        ) : entry.completedTracks.length === 0 ? (
          <p>Nenhuma trilha concluída.</p>
        ) : (
          <ul aria-label={`Trilhas concluídas por ${studentName}`}>
            {entry.completedTracks.map((track) => (
              <li key={track.trackId}>
                <TextTag size="sm" variant="default">
                  {track.title}
                </TextTag>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="teacher-talent-card__actions">
        <ButtonLink
          aria-label={`Ver perfil de ${studentName}`}
          size="sm"
          to={`/perfil/${encodeURIComponent(profileLookup)}`}
          variant="outline"
        >
          Ver perfil
        </ButtonLink>
        <Button
          aria-label={`Escrever nota para ${studentName}`}
          onClick={() => onWriteNote(studentId)}
          size="sm"
        >
          Escrever nota
        </Button>
      </div>
    </article>
  )
}

export default function TeacherTalentBankView() {
  const directoryQuery = useTalentBankDirectory()
  const [query, setQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<TalentFilter>('all')
  const [noteStudentId, setNoteStudentId] = useState<string | null>(null)
  const currentWeekStart = useCurrentWeekStart()
  const directory = directoryQuery.data
  const students = useMemo(() => directory?.students ?? [], [directory])
  const filteredStudents = useMemo(
    () =>
      students.filter(
        (entry) =>
          matchesFilter(entry, selectedFilter) && matchesSearch(entry, query),
      ),
    [query, selectedFilter, students],
  )
  const hasUnavailableProfiles = Boolean(
    directory && directory.students.length < directory.registrations.length,
  )
  const averageIra = useMemo(
    () => (hasUnavailableProfiles ? '—' : formatAverageIra(students)),
    [hasUnavailableProfiles, students],
  )
  const newEntriesThisWeek = useMemo(
    () =>
      countCurrentWeekEntries(directory?.registrations ?? [], currentWeekStart),
    [currentWeekStart, directory],
  )
  const hasIncompleteData = Boolean(
    directory &&
    (hasUnavailableProfiles ||
      directory.students.some((entry) => entry.completedTracks === null)),
  )
  const closeCreateNote = useCallback(() => setNoteStudentId(null), [])

  return (
    <main
      aria-labelledby="teacher-talent-bank-title"
      className="teacher-talent-bank-page"
    >
      <header className="teacher-talent-bank-page__header">
        <PageHeroCopy
          description="Encontre alunos, conheça suas trilhas concluídas e registre observações para futuras oportunidades."
          eyebrow="NADIC · Professor"
          title="Banco de talentos"
          titleId="teacher-talent-bank-title"
        />
      </header>

      <section
        aria-label="Estatísticas do banco de talentos"
        className="teacher-talent-bank-page__stats"
      >
        <StatCard
          icon={Users}
          label="Talentos cadastrados"
          tone="primary"
          value={directory ? directory.registrations.length : '—'}
        />
        <StatCard
          icon={GraduationCap}
          label="IRA médio"
          tone="teal"
          value={directory ? averageIra : '—'}
        />
        <StatCard
          icon={UserPlus}
          label="Novas entradas esta semana"
          tone="purple"
          value={directory ? `+${newEntriesThisWeek}` : '—'}
        />
      </section>

      <section
        aria-label="Busca e filtros de talentos"
        className="teacher-talent-bank-page__controls"
      >
        <SearchInput
          aria-label="Buscar aluno por nome, matrícula, curso ou trilha"
          className="teacher-talent-bank-page__search"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nome, matrícula, curso ou trilha..."
          value={query}
        />

        <div
          aria-label="Filtrar talentos"
          className="teacher-talent-bank-page__filters"
          role="group"
        >
          {TALENT_FILTERS.map((filter) => (
            <FilterTag
              active={selectedFilter === filter.id}
              key={filter.id}
              label={filter.label}
              onClick={() => setSelectedFilter(filter.id)}
            />
          ))}
        </div>
      </section>

      {hasIncompleteData ? (
        <aside className="teacher-talent-bank-page__warning" role="status">
          <AlertCircle aria-hidden="true" size={18} />
          <p>
            Alguns perfis ou trilhas não puderam ser carregados. A listagem pode
            estar incompleta.
          </p>
          <Button
            onClick={() => void directoryQuery.refetch()}
            size="sm"
            variant="ghost"
          >
            Tentar novamente
          </Button>
        </aside>
      ) : null}

      <section
        aria-label="Alunos no banco de talentos"
        className="teacher-talent-bank-page__directory"
      >
        {directoryQuery.isLoading ? (
          <LoadingState
            className="teacher-talent-bank-page__loading"
            skeletonCount={4}
          />
        ) : directoryQuery.isError ? (
          <ErrorState
            className="teacher-talent-bank-page__state"
            message="Não foi possível carregar o banco de talentos agora."
            onRetry={() => void directoryQuery.refetch()}
          />
        ) : students.length === 0 ? (
          <EmptyState
            className="teacher-talent-bank-page__state"
            description="Os alunos aparecerão aqui quando ativarem a participação no banco de talentos."
            title="Nenhum talento cadastrado"
          />
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            className="teacher-talent-bank-page__state"
            description="Tente outro nome, matrícula, curso, trilha ou filtro."
            icon={SearchX}
            title="Nenhum aluno encontrado"
          />
        ) : (
          <>
            <header className="teacher-talent-bank-page__results-header">
              <h2>Talentos encontrados</h2>
              <span>
                {filteredStudents.length}{' '}
                {filteredStudents.length === 1 ? 'aluno' : 'alunos'}
              </span>
            </header>

            <div className="teacher-talent-bank-page__list" role="list">
              {filteredStudents.map((entry) => (
                <div key={entry.registration.id} role="listitem">
                  <TalentStudentCard
                    entry={entry}
                    onWriteNote={setNoteStudentId}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {noteStudentId ? (
        <CreateNoteModal
          key={noteStudentId}
          onClose={closeCreateNote}
          onSaved={closeCreateNote}
          studentId={noteStudentId}
        />
      ) : null}
    </main>
  )
}
