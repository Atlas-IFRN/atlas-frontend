import { useQuery } from '@tanstack/react-query'
import { getTrackById, getTracks } from '../services/tracks'

export const tracksQueryKeys = {
  all: ['tracks'] as const,
  detail: (trackId: string) => ['tracks', trackId] as const,
}

export function useTracks() {
  return useQuery({
    queryKey: tracksQueryKeys.all,
    queryFn: getTracks,
  })
}

export function useTrack(trackId?: string) {
  return useQuery({
    queryKey: tracksQueryKeys.detail(trackId ?? ''),
    queryFn: () => getTrackById(trackId as string),
    enabled: Boolean(trackId),
  })
}
