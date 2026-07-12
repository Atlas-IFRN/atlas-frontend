import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { enrollInTrack, getTrackById, getTracks } from '../services/tracks'

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

export function useEnrollInTrack() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: enrollInTrack,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: tracksQueryKeys.all }),
  })
}
