import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  createComment,
  createPost,
  deletePost,
  getFeedPage,
  getPost,
  getPostComments,
  getUserFeedPage,
  setPostFixed,
  updatePost,
  type CreatePostInput,
  type FeedFilterValue,
} from '../services/feed'

export const feedKeys = {
  all: ['feed'] as const,
  list: (filter: FeedFilterValue) => ['feed', 'list', filter] as const,
  byUser: (matricula: string) => ['feed', 'by-user', matricula] as const,
  detail: (postId: string) => ['feed', 'post', postId] as const,
  comments: (postId: string) => ['feed', 'post', postId, 'comments'] as const,
}

/** Feed paginado (infinite scroll / "carregar mais") por filtro. */
export function useFeedPosts(filter: FeedFilterValue) {
  return useInfiniteQuery({
    queryKey: feedKeys.list(filter),
    queryFn: ({ pageParam }) => getFeedPage(filter, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  })
}

/** Publicações exibidas no perfil de um usuário. */
export function useUserFeedPosts(matricula?: string) {
  return useInfiniteQuery({
    queryKey: feedKeys.byUser(matricula ?? ''),
    queryFn: ({ pageParam }) => getUserFeedPage(matricula as string, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: Boolean(matricula),
  })
}

export function useFeedPost(postId?: string) {
  return useQuery({
    queryKey: feedKeys.detail(postId ?? ''),
    queryFn: () => getPost(postId as string),
    enabled: Boolean(postId),
  })
}

export function usePostComments(postId: string, enabled: boolean) {
  return useQuery({
    queryKey: feedKeys.comments(postId),
    queryFn: () => getPostComments(postId),
    enabled,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePostInput) => createPost(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: feedKeys.all })
    },
  })
}

export function useUpdatePost(postId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patch: { content?: string }) => updatePost(postId, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: feedKeys.all })
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: feedKeys.all })
    },
  })
}

export function useFixPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, fixed }: { postId: string; fixed: boolean }) =>
      setPostFixed(postId, fixed),
    onSuccess: () => {
      // Fixar reordena o feed → revalida todas as listas e o detalhe.
      void queryClient.invalidateQueries({ queryKey: feedKeys.all })
    },
  })
}

export function useAddComment(postId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ content, parentId }: { content: string; parentId?: string }) =>
      createComment(postId, content, parentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: feedKeys.comments(postId) })
      void queryClient.invalidateQueries({ queryKey: feedKeys.detail(postId) })
      // Atualiza tanto o feed principal quanto as listas exibidas em perfis.
      void queryClient.invalidateQueries({ queryKey: feedKeys.all })
    },
  })
}
