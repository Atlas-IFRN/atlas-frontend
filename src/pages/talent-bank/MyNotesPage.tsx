import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, MessageSquareText } from 'lucide-react'
import { StatCard } from '../../components/atoms/StatCard'
import { TextTag } from '../../components/atoms/TextTag'
import { UserChip } from '../../components/molecules/UserChip'
import { PageHeroCopy } from '../../components/molecules/PageHeroCopy'
import { EmptyState, ErrorState, LoadingState } from '../../components/states'
import type { AuthUser } from '../../contexts/AuthContext'
import { useMyNotes, useNoteAuthors } from '../../hooks/useNotes'
import type { NoteTag } from '../../lib/notas-mock'
import type { NoteSkillTag, StudentNote } from '../../services/notes'
import './MyNotesPage.css'

const NOTE_TAGS: Record<
  NoteSkillTag,
  { label: string; variant: NoteTag }
> = {
  HARD_SKILL: { label: 'Hard Skill', variant: 'hard-skill' },
  SOFT_SKILL: { label: 'Soft Skill', variant: 'soft-skill' },
}

const NOTE_DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  month: 'short',
  year: 'numeric',
})

function formatNoteDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Data indisponível'
  }

  return NOTE_DATE_FORMATTER.format(date).replace(/\./g, '')
}

function NoteCard({
  note,
  professor,
}: {
  note: StudentNote
  professor?: AuthUser
}) {
  const contentRef = useRef<HTMLQuoteElement>(null)
  const [canExpand, setCanExpand] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const accentTag = note.tags.includes('HARD_SKILL')
    ? 'hard-skill'
    : 'soft-skill'
  const professorName =
    professor?.fullName || professor?.firstName || 'Professor'

  useEffect(() => {
    const content = contentRef.current

    if (!content || expanded) {
      return
    }

    let animationFrame = 0
    const measureOverflow = () => {
      setCanExpand(content.scrollHeight > content.clientHeight + 1)
    }
    const scheduleMeasurement = () => {
      window.cancelAnimationFrame(animationFrame)
      animationFrame = window.requestAnimationFrame(measureOverflow)
    }
    const resizeObserver = new ResizeObserver(scheduleMeasurement)

    resizeObserver.observe(content)
    scheduleMeasurement()

    return () => {
      window.cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
    }
  }, [expanded, note.content])

  return (
    <article
      className={`note-card note-card--${accentTag}${
        expanded ? ' note-card--expanded' : ''
      }`}
    >
      <header className="note-card__header">
        <UserChip
          name={professorName}
          role="Professor"
          src={professor?.image || undefined}
          size="sm"
        />
      </header>

      <div className="note-card__body">
        <blockquote className="note-card__content" ref={contentRef}>
          “{note.content}”
        </blockquote>

        {canExpand ? (
          <button
            aria-expanded={expanded}
            className="note-card__toggle"
            onClick={() => setExpanded((isExpanded) => !isExpanded)}
            type="button"
          >
            {expanded ? 'Ver menos' : '… Ver mais'}
          </button>
        ) : null}
      </div>

      <footer className="note-card__footer">
        <div className="note-card__tags">
          {note.tags.map((tag) => (
            <TextTag
              key={tag}
              size="sm"
              variant={NOTE_TAGS[tag].variant}
              withDot
            >
              {NOTE_TAGS[tag].label}
            </TextTag>
          ))}
        </div>

        <time className="note-card__date" dateTime={note.createdAt}>
          <CalendarDays aria-hidden="true" size={14} strokeWidth={1.8} />
          {formatNoteDate(note.createdAt)}
        </time>
      </footer>
    </article>
  )
}

export default function MyNotesPage() {
  const notesQuery = useMyNotes()
  const authorsQuery = useNoteAuthors(notesQuery.data)
  const notes = useMemo(
    () =>
      [...(notesQuery.data ?? [])].sort(
        (first, second) =>
          Date.parse(second.createdAt) - Date.parse(first.createdAt),
      ),
    [notesQuery.data],
  )
  const indexedNotes = useMemo(
    () => notes.map((note, index) => ({ index, note })),
    [notes],
  )
  const noteColumns = useMemo(
    () => [
      indexedNotes.filter(({ index }) => index % 2 === 0),
      indexedNotes.filter(({ index }) => index % 2 !== 0),
    ],
    [indexedNotes],
  )
  const isLoading =
    notesQuery.isLoading || (notes.length > 0 && authorsQuery.isLoading)

  return (
    <main className="my-notes-page" aria-labelledby="my-notes-title">
      <header className="my-notes-page__header">
        <PageHeroCopy
          description="Veja as observações registradas pelos seus professores durante entrevistas, projetos e outras atividades acadêmicas."
          eyebrow="Feedback dos professores"
          title="Minhas notas"
          titleId="my-notes-title"
        />

        <StatCard
          aria-label={`${notes.length} notas recebidas`}
          className="my-notes-page__count"
          icon={MessageSquareText}
          label="Notas recebidas"
          tone="primary"
          value={notesQuery.isLoading ? '—' : notes.length}
        />
      </header>

      <section className="my-notes-page__content" aria-label="Notas recebidas">
        {isLoading ? (
          <LoadingState
            className="my-notes-page__loading"
            skeletonCount={4}
          />
        ) : notesQuery.isError ? (
          <ErrorState
            className="my-notes-page__state"
            message="Não foi possível carregar suas notas agora."
            onRetry={() => void notesQuery.refetch()}
          />
        ) : notes.length === 0 ? (
          <EmptyState
            className="my-notes-page__state"
            description="As observações registradas pelos seus professores aparecerão aqui."
            title="Você ainda não recebeu notas"
          />
        ) : (
          <div className="my-notes-page__list" role="list">
            {noteColumns.map((column, columnIndex) => (
              <div
                className="my-notes-page__column"
                key={columnIndex}
                role="presentation"
              >
                {column.map(({ index, note }) => (
                  <div
                    aria-posinset={index + 1}
                    aria-setsize={notes.length}
                    className="my-notes-page__list-item"
                    key={note.id}
                    role="listitem"
                    style={{ order: index }}
                  >
                    <NoteCard
                      note={note}
                      professor={authorsQuery.data?.get(note.professorId)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
