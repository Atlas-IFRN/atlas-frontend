import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  activateTalentRegistration,
  createTalentRegistration,
  deactivateTalentRegistration,
  getMyTalentRegistration,
} from '../services/talentBank'

export const talentBankQueryKeys = {
  registration: ['talent-bank', 'registration'] as const,
}

export function useTalentRegistration() {
  return useQuery({
    queryKey: talentBankQueryKeys.registration,
    queryFn: getMyTalentRegistration,
  })
}

export function useJoinTalentBank() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (hasExistingRegistration: boolean) =>
      hasExistingRegistration
        ? activateTalentRegistration()
        : createTalentRegistration(),
    onSuccess: (registration) => {
      queryClient.setQueryData(
        talentBankQueryKeys.registration,
        registration,
      )
    },
  })
}

export function useLeaveTalentBank() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deactivateTalentRegistration,
    onSuccess: (registration) => {
      queryClient.setQueryData(
        talentBankQueryKeys.registration,
        registration,
      )
    },
  })
}
