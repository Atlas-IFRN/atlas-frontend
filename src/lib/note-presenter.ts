import type { AuthUser } from '../contexts/AuthContext'
import type { NoteSkillTag, StudentNote } from '../services/notes'

export type NoteTag = 'hard-skill' | 'soft-skill'

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

const NOTE_TAGS: Record<
  NoteSkillTag,
  { label: string; variant: NoteTag }
> = {
  HARD_SKILL: { label: 'Hard Skill', variant: 'hard-skill' },
  SOFT_SKILL: { label: 'Soft Skill', variant: 'soft-skill' },
}

const NOTE_TAG_LABELS: Record<NoteTag, string> = {
  'hard-skill': 'Hard Skill',
  'soft-skill': 'Soft Skill',
}

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

export function noteTagLabel(tag: NoteTag) {
  return NOTE_TAG_LABELS[tag]
}

export function noteTagVariant(tag: NoteSkillTag) {
  return NOTE_TAGS[tag].variant
}

export function formatStudentNoteDateTime(
  value: string,
  separator = ' · ',
) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'data indisponível'
  }

  const formattedDate = DATE_FORMATTER.format(date).replace(/\./g, '')
  return `${formattedDate}${separator}${TIME_FORMATTER.format(date)}`
}

export function toStudentNotesModalNotes(
  notes: StudentNote[],
  authorsById?: ReadonlyMap<string, AuthUser>,
): StudentNotesModalNote[] {
  return notes.map((note) => {
    const professor = authorsById?.get(note.professorId)

    return {
      content: note.content,
      createdAt: formatStudentNoteDateTime(note.createdAt),
      dateTime: note.createdAt,
      id: note.id,
      professor: {
        avatarSrc: professor?.image || undefined,
        name:
          professor?.fullName ||
          professor?.firstName ||
          'Professor não identificado',
      },
      tags: note.tags.map(noteTagVariant),
    }
  })
}
