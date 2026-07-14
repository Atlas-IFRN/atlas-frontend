import axios from 'axios'
import api from './api'

export type NoteSkillTag = 'HARD_SKILL' | 'SOFT_SKILL'

export interface StudentNote {
  id: string
  studentId: string
  professorId: string
  content: string
  tags: NoteSkillTag[]
  createdAt: string
  updatedAt: string
}

interface StudentNoteApi {
  id: string
  student_id: string
  orientador_id: string
  content: string
  tags: NoteSkillTag[]
  created_at: string
  updated_at: string
}

interface PaginatedStudentNotesApi {
  count: number
  next: string | null
  previous: string | null
  results: StudentNoteApi[]
}

export interface CreateStudentNoteInput {
  studentId: string
  content: string
  tags: NoteSkillTag[]
}

function toStudentNote(note: StudentNoteApi): StudentNote {
  return {
    id: note.id,
    studentId: note.student_id,
    professorId: note.orientador_id,
    content: note.content,
    tags: note.tags,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
  }
}

export async function createStudentNote(
  input: CreateStudentNoteInput,
): Promise<StudentNote> {
  const { data } = await api.post<StudentNoteApi>(
    'scholarship/talents/notes/',
    {
      student_id: input.studentId,
      content: input.content,
      tags: input.tags,
    },
  )

  return toStudentNote(data)
}

export async function getStudentNotes(): Promise<StudentNote[]> {
  const notes: StudentNote[] = []
  let page = 1
  let hasNextPage = true

  while (hasNextPage) {
    const { data } = await api.get<PaginatedStudentNotesApi>(
      'scholarship/talents/notes/',
      {
        params: {
          ordering: '-created_at',
          page,
          page_size: 50,
        },
      },
    )

    notes.push(...data.results.map(toStudentNote))
    hasNextPage = Boolean(data.next)
    page += 1
  }

  return notes
}

export function getNoteErrorMessage(error: unknown) {
  const fallback = 'Não foi possível salvar a nota. Tente novamente.'

  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback
  }

  const data = error.response?.data

  if (typeof data === 'string') {
    return data
  }

  if (!data || typeof data !== 'object') {
    return fallback
  }

  const errorData = data as Record<string, unknown>
  const detail = errorData.detail

  if (typeof detail === 'string') {
    return detail
  }

  for (const field of ['content', 'tags', 'student_id']) {
    const fieldError = errorData[field]

    if (typeof fieldError === 'string') {
      return fieldError
    }

    if (Array.isArray(fieldError) && typeof fieldError[0] === 'string') {
      return fieldError[0]
    }
  }

  return fallback
}
