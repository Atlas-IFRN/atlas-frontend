import type { FeedAuthor, PostComment } from '../../../types/feed'

let sequence = 0

/** Gera um id local estável para comentários criados na sessão (sem backend). */
export function nextLocalId(prefix = 'local'): string {
  sequence += 1
  return `${prefix}-${sequence}`
}

export function createComment(
  author: FeedAuthor,
  content: string,
): PostComment {
  return {
    id: nextLocalId('comment'),
    author,
    content,
    time: 'agora',
    likes: 0,
    liked: false,
    replies: [],
  }
}

/** Alterna a curtida de um comentário (busca recursiva por id). */
export function toggleCommentLike(
  comments: PostComment[],
  commentId: string,
): PostComment[] {
  return comments.map((comment) => {
    if (comment.id === commentId) {
      const liked = !comment.liked
      return {
        ...comment,
        liked,
        likes: comment.likes + (liked ? 1 : -1),
      }
    }

    if (comment.replies?.length) {
      return {
        ...comment,
        replies: toggleCommentLike(comment.replies, commentId),
      }
    }

    return comment
  })
}

/** Insere uma resposta sob o comentário `parentId`. */
export function addReply(
  comments: PostComment[],
  parentId: string,
  reply: PostComment,
): PostComment[] {
  return comments.map((comment) => {
    if (comment.id === parentId) {
      return { ...comment, replies: [...(comment.replies ?? []), reply] }
    }

    if (comment.replies?.length) {
      return { ...comment, replies: addReply(comment.replies, parentId, reply) }
    }

    return comment
  })
}

/** Conta comentários e respostas em toda a árvore. */
export function countComments(comments: PostComment[]): number {
  return comments.reduce(
    (total, comment) => total + 1 + countComments(comment.replies ?? []),
    0,
  )
}
