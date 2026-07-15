import { useQuery } from '@tanstack/react-query'
import { getActiveScholarships, getTopTracks } from '../services/widgets'

/**
 * Trilhas do usuário ordenadas por progresso (widget "Minhas trilhas").
 * Sem `userUuid`, usa o usuário logado (feed). Com `userUuid`, o perfil daquele
 * usuário (perfil de terceiros).
 */
export function useTopTracks(userUuid?: string, enabled = true) {
  return useQuery({
    queryKey: ['widgets', 'top-tracks', userUuid ?? 'me'],
    queryFn: () => getTopTracks(userUuid),
    enabled,
  })
}

/** Bolsas ativas globais (widget "Bolsas ativas"). */
export function useActiveScholarships(enabled = true) {
  return useQuery({
    queryKey: ['widgets', 'active-scholarships'],
    queryFn: () => getActiveScholarships(3),
    enabled,
  })
}
