import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Comment } from '../molecules/Comment'
import { CommentComposer } from '../molecules/CommentComposer'
import type { PostComment } from '../types'

interface PostCommentsProps {
  comments: PostComment[]
  currentUserName: string
  onAddComment: (content: string) => void
  onReply: (parentId: string, content: string) => void
  onToggleLike: (commentId: string) => void
}

const INITIAL_VISIBLE = 3
const BLOCK_SIZE = 3

/** Seção de comentários (estilo LinkedIn): thread + input ao final. */
export function PostComments({
  comments,
  currentUserName,
  onAddComment,
  onReply,
  onToggleLike,
}: PostCommentsProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE)
  const previousLength = useRef(comments.length)

  // Ao publicar um novo comentário, garante que ele apareça (revela a lista).
  useEffect(() => {
    if (comments.length > previousLength.current) {
      setVisibleCount(comments.length)
    }
    previousLength.current = comments.length
  }, [comments.length])

  const visibleComments = comments.slice(0, visibleCount)
  const remaining = comments.length - visibleCount

  return (
    <section className="post-comments" aria-label="Comentários">
      {comments.length > 0 ? (
        <div className="post-comments__list">
          {visibleComments.map((comment) => (
            <Comment
              comment={comment}
              currentUserName={currentUserName}
              key={comment.id}
              onReply={onReply}
              onToggleLike={onToggleLike}
            />
          ))}
        </div>
      ) : (
        <p className="post-comments__empty">
          Seja o primeiro a comentar nesta publicação.
        </p>
      )}

      {remaining > 0 ? (
        <button
          className="post-comments__more"
          onClick={() =>
            setVisibleCount((count) => count + BLOCK_SIZE)
          }
          type="button"
        >
          <ChevronDown aria-hidden="true" size={16} strokeWidth={2} />
          Ver mais {remaining} {remaining === 1 ? 'comentário' : 'comentários'}
        </button>
      ) : null}

      <CommentComposer
        currentUserName={currentUserName}
        onSubmit={onAddComment}
      />
    </section>
  )
}
