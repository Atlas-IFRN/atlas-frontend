import { useQuery } from '@tanstack/react-query'
import {
  searchProfiles,
  searchScholarships,
  searchTracks,
} from '../services/search'

/** Mínimo de caracteres para disparar a busca. */
export const SEARCH_MIN_LENGTH = 2

/**
 * Busca global: dispara, em paralelo, as três buscas por serviço (trilhas,
 * bolsas, perfis) para o termo informado. Espera-se que `term` já venha
 * debounced. As queries só rodam quando `term` tem ao menos SEARCH_MIN_LENGTH
 * caracteres.
 *
 * Retorna cada seção como um resultado de `useQuery` (`data`, `isLoading`,
 * `isError`), além de `enabled` — se a busca está ativa para o termo atual.
 */
export function useGlobalSearch(term: string, limit = 4) {
  const query = term.trim()
  const enabled = query.length >= SEARCH_MIN_LENGTH

  const tracks = useQuery({
    queryKey: ['search', 'tracks', query, limit],
    queryFn: () => searchTracks(query, limit),
    enabled,
  })

  const scholarships = useQuery({
    queryKey: ['search', 'scholarships', query, limit],
    queryFn: () => searchScholarships(query, limit),
    enabled,
  })

  const profiles = useQuery({
    queryKey: ['search', 'profiles', query, limit],
    queryFn: () => searchProfiles(query, limit),
    enabled,
  })

  return { query, enabled, tracks, scholarships, profiles }
}
