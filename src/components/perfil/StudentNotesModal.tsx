import { useEffect, useId, useRef, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { AuthUser } from '../../contexts/AuthContext'
import { getCourseLabel } from '../../lib/course-label'
import { tagLabel, type NoteTag } from '../../lib/notas-mock'
import { Button } from '../atoms/Button'
import { ButtonLink } from '../atoms/ButtonLink'
import { TextTag } from '../atoms/TextTag'
import { UserChip } from '../molecules/UserChip'
import { EmptyState } from '../states/EmptyState'
import './Profile.css'

export interface StudentNotesModalNote {
  content: string
  createdAt: string
  dateTime: string
  id: string
  professor: {
    avatarSrc?: string
    name: string
  }
  tags: NoteTag[]
}

interface StudentNotesModalProps {
  notes: StudentNotesModalNote[]
  onClose: () => void
  returnTo?: string
  student: AuthUser
}

function noteCountLabel(count: number) {
  return `${count} ${count === 1 ? 'nota' : 'notas'}`
}

function studentDetails(student: AuthUser, notesCount: number) {
  return [
    student.courseName ? getCourseLabel(student.courseName) : null,
    student.period !== null ? `${student.period}º período` : null,
    noteCountLabel(notesCount),
  ]
    .filter((detail): detail is string => Boolean(detail))
    .join(' · ')
}

function displayDate(createdAt: string) {
  return createdAt.replace(/,\s*/, ' · ')
}

export function StudentNotesModal({
  notes,
  onClose,
  returnTo,
  student,
}: StudentNotesModalProps) {
  const titleId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const studentName = student.fullName || student.firstName

  useEffect(() => {
    const previouslyFocusedElement =
      document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

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

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return createPortal(
    <div
      className="student-notes-modal"
      onMouseDown={handleBackdropClick}
      role="presentation"
    >
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="student-notes-modal__dialog"
        role="dialog"
      >
        <h2 className="student-notes-modal__title" id={titleId}>
          Notas de {studentName}
        </h2>

        <header className="student-notes-modal__header">
          <UserChip
            className="student-notes-modal__student"
            name={studentName}
            role={studentDetails(student, notes.length)}
            size="lg"
            src={student.image || undefined}
          />
          <Button
            aria-label="Fechar notas do aluno"
            className="student-notes-modal__close"
            iconLeft={X}
            onClick={onClose}
            ref={closeButtonRef}
            size="sm"
            variant="ghost"
          />
        </header>

        <div
          aria-label={`Lista com ${noteCountLabel(notes.length)}`}
          className="student-notes-modal__body"
          role="list"
        >
          {notes.length ? (
            notes.map((note) => (
              <article
                className="student-notes-modal__note"
                key={note.id}
                role="listitem"
              >
                <UserChip
                  className="student-notes-modal__author"
                  name={`Prof. ${note.professor.name}`}
                  role={note.tags.map(tagLabel).join(' · ')}
                  size="md"
                  src={note.professor.avatarSrc}
                />

                <blockquote className="student-notes-modal__content">
                  “{note.content}”
                </blockquote>

                <footer className="student-notes-modal__note-footer">
                  <div className="student-notes-modal__note-tags">
                    {note.tags.map((tag) => (
                      <TextTag key={tag} size="sm" variant={tag}>
                        {tagLabel(tag)}
                      </TextTag>
                    ))}
                  </div>
                  <time dateTime={note.dateTime}>
                    {displayDate(note.createdAt)}
                  </time>
                </footer>
              </article>
            ))
          ) : (
            <EmptyState
              description="As notas registradas para este aluno aparecerão aqui."
              title="Nenhuma nota cadastrada"
            />
          )}
        </div>

        <footer className="student-notes-modal__footer">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
          <ButtonLink
            state={{
              returnTo:
                returnTo ??
                `/perfil/${encodeURIComponent(student.matricula)}`,
            }}
            to={`/banco-talentos/${encodeURIComponent(student.id)}/notas/nova`}
          >
            Nova nota
          </ButtonLink>
        </footer>
      </section>
    </div>,
    document.body,
  )
}
