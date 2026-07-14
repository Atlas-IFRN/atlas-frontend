import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createBanner,
  deleteBanner,
  getBanners,
  setBannerOrder,
  updateBanner,
  type BannerInput,
} from '../services/banners'

export const bannerKeys = {
  all: ['banners'] as const,
  list: (all: boolean) => ['banners', all] as const,
}

/** Banners ativos (carrossel público) ou todos (modal de gestão, `all=true`). */
export function useBanners(all = false) {
  return useQuery({
    queryKey: bannerKeys.list(all),
    queryFn: () => getBanners(all),
  })
}

export function useCreateBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: BannerInput) => createBanner(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bannerKeys.all })
    },
  })
}

export function useUpdateBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<BannerInput> }) =>
      updateBanner(id, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bannerKeys.all })
    },
  })
}

export function useDeleteBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBanner(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bannerKeys.all })
    },
  })
}

export function useReorderBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, order }: { id: string; order: number }) => setBannerOrder(id, order),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bannerKeys.all })
    },
  })
}
