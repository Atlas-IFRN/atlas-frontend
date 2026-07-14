import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth, type AuthUser } from '../contexts/AuthContext'
import { getUserProfileById } from '../services/auth'
import { getStudentNotes, type StudentNote } from '../services/notes'

export const notesQueryKeys = {
  all: ['notes'] as const,
  mine: (userId: string) => ['notes', 'mine', userId] as const,
  authors: (authorIds: string[]) =>
    ['notes', 'authors', ...authorIds] as const,
}

export function useMyNotes(enabled = true) {
  const { user } = useAuth()

  return useQuery({
    enabled: Boolean(enabled && user?.id),
    queryFn: getStudentNotes,
    queryKey: notesQueryKeys.mine(user?.id ?? ''),
  })
}

async function getNoteAuthors(authorIds: string[]) {
  const profileResults = await Promise.allSettled(
    authorIds.map(async (authorId) => ({
      authorId,
      profile: await getUserProfileById(authorId),
    })),
  )
  const authorsById = new Map<string, AuthUser>()

  profileResults.forEach((result) => {
    if (result.status === 'fulfilled') {
      authorsById.set(result.value.authorId, result.value.profile)
    }
  })

  return authorsById
}

export function useNoteAuthors(notes?: StudentNote[]) {
  const authorIds = useMemo(
    () =>
      [...new Set((notes ?? []).map((note) => note.professorId))]
        .filter(Boolean)
        .sort(),
    [notes],
  )

  return useQuery({
    enabled: authorIds.length > 0,
    queryFn: () => getNoteAuthors(authorIds),
    queryKey: notesQueryKeys.authors(authorIds),
    staleTime: 5 * 60 * 1000,
  })
}
