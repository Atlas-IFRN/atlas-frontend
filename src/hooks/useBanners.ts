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

/**
 * As mutações de banner atualizam apenas a listagem de GESTÃO (`all=true`) —
 * o que o docente vê no modal enquanto trabalha. A listagem PÚBLICA do
 * carrossel (`all=false`) é deixada intacta de propósito: ela só é atualizada
 * quando o docente confirma as mudanças (ver `usePublishBanners`), evitando que
 * o carrossel "pisque" a cada edição intermediária.
 */
function invalidateManagementList(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: bannerKeys.list(true) })
}

/**
 * Publica as alterações no carrossel: invalida a listagem pública, forçando o
 * `FeedPage` a rebuscar os banners ativos. É o "salvar alterações" do modal.
 */
export function usePublishBanners() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: bannerKeys.list(false) })
}

export function useCreateBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: BannerInput) => createBanner(input),
    onSuccess: () => {
      void invalidateManagementList(queryClient)
    },
  })
}

export function useUpdateBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<BannerInput> }) =>
      updateBanner(id, patch),
    onSuccess: () => {
      void invalidateManagementList(queryClient)
    },
  })
}

export function useDeleteBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBanner(id),
    onSuccess: () => {
      void invalidateManagementList(queryClient)
    },
  })
}

export function useReorderBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, order }: { id: string; order: number }) => setBannerOrder(id, order),
    onSuccess: () => {
      void invalidateManagementList(queryClient)
    },
  })
}
