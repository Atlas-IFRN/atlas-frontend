import { useEffect, useRef, useState } from 'react'
import { CalendarDays, MessageSquareText } from 'lucide-react'
import { StatCard } from '../../components/atoms/StatCard'
import { TextTag } from '../../components/atoms/TextTag'
import { UserChip } from '../../components/molecules/UserChip'
import { PageHeroCopy } from '../../components/molecules/PageHeroCopy'
import {
  MINHAS_NOTAS,
  tagLabel,
  type ProfileNote,
} from '../../lib/notas-mock'
import './MyNotesPage.css'

const INDEXED_NOTES = MINHAS_NOTAS.map((note, index) => ({ index, note }))
const NOTE_COLUMNS = [
  INDEXED_NOTES.filter(({ index }) => index % 2 === 0),
  INDEXED_NOTES.filter(({ index }) => index % 2 !== 0),
]

function NoteCard({ note }: { note: ProfileNote }) {
  const contentRef = useRef<HTMLQuoteElement>(null)
  const [canExpand, setCanExpand] = useState(false)
  const [expanded, setExpanded] = useState(false)

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
      className={`note-card note-card--${note.tag}${
        expanded ? ' note-card--expanded' : ''
      }`}
    >
      <header className="note-card__header">
        <UserChip
          name={note.professor.name}
          role="Professor"
          src={note.professor.avatarSrc}
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
        <TextTag size="sm" variant={note.tag} withDot>
          {tagLabel(note.tag)}
        </TextTag>

        <time className="note-card__date" dateTime={note.dateTime}>
          <CalendarDays aria-hidden="true" size={14} strokeWidth={1.8} />
          {note.createdAt}
        </time>
      </footer>
    </article>
  )
}

export default function MyNotesPage() {
  return (
    <main className="my-notes-page" aria-labelledby="my-notes-title">
      <header className="my-notes-page__header">
        <PageHeroCopy
          eyebrow="Feedback dos professores"
          title="Minhas notas"
          titleId="my-notes-title"
          description="Veja as observações registradas pelos seus professores durante entrevistas, projetos e outras atividades acadêmicas."
        />

        <StatCard
          aria-label={`${MINHAS_NOTAS.length} notas recebidas`}
          className="my-notes-page__count"
          icon={MessageSquareText}
          label="Notas recebidas"
          tone="primary"
          value={MINHAS_NOTAS.length}
        />
      </header>

      <section className="my-notes-page__content" aria-label="Notas recebidas">
        <div className="my-notes-page__list" role="list">
          {NOTE_COLUMNS.map((column, columnIndex) => (
            <div
              className="my-notes-page__column"
              key={columnIndex}
              role="presentation"
            >
              {column.map(({ index, note }) => (
                <div
                  aria-posinset={index + 1}
                  aria-setsize={MINHAS_NOTAS.length}
                  className="my-notes-page__list-item"
                  key={note.id}
                  role="listitem"
                  style={{ order: index }}
                >
                  <NoteCard note={note} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
