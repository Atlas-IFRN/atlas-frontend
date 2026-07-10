import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Avatar } from '../../atoms/Avatar'
import { StatusBadge } from '../../atoms/StatusBadge'
import { renderRichText } from '../richText'
import type { PostComment } from '../types'
import { CommentComposer } from './CommentComposer'

interface CommentProps {
  comment: PostComment
  currentUserName: string
  /** Comentário aninhado (resposta). Bloqueia novos níveis de resposta. */
  isReply?: boolean
  onToggleLike: (commentId: string) => void
  onReply: (parentId: string, content: string) => void
}

export function Comment({
  comment,
  currentUserName,
  isReply = false,
  onToggleLike,
  onReply,
}: CommentProps) {
  const [replying, setReplying] = useState(false)

  function handleReply(content: string) {
    onReply(comment.id, content)
    setReplying(false)
  }

  return (
    <div className={`comment${isReply ? ' comment--reply' : ''}`}>
      <Avatar
        color={comment.author.avatarColor ?? 'blue'}
        name={comment.author.name}
        size="sm"
        src={comment.author.avatarSrc}
      />

      <div className="comment__main">
        <div className="comment__bubble">
          <div className="comment__meta">
            <strong>{comment.author.name}</strong>
            {comment.author.badge ? (
              <StatusBadge size="sm" status="primary">
                {comment.author.badge}
              </StatusBadge>
            ) : null}
            <span className="comment__role">{comment.author.role}</span>
          </div>

          <div className="comment__content">{renderRichText(comment.content)}</div>
        </div>

        <div className="comment__toolbar">
          <button
            aria-pressed={comment.liked ?? false}
            className={`comment__action${
              comment.liked ? ' comment__action--liked' : ''
            }`}
            onClick={() => onToggleLike(comment.id)}
            type="button"
          >
            <Heart
              aria-hidden="true"
              fill={comment.liked ? 'currentColor' : 'none'}
              size={13}
              strokeWidth={2}
            />
            Curtir
            {comment.likes > 0 ? (
              <span className="comment__like-count">{comment.likes}</span>
            ) : null}
          </button>

          {!isReply ? (
            <button
              className="comment__action"
              onClick={() => setReplying((open) => !open)}
              type="button"
            >
              Responder
            </button>
          ) : null}

          <span className="comment__time">{comment.time}</span>
        </div>

        {replying ? (
          <CommentComposer
            autoFocus
            compact
            currentUserName={currentUserName}
            onCancel={() => setReplying(false)}
            onSubmit={handleReply}
            placeholder={`Respondendo a ${comment.author.name}…`}
            submitLabel="Responder"
          />
        ) : null}

        {comment.replies && comment.replies.length > 0 ? (
          <div className="comment__replies">
            {comment.replies.map((reply) => (
              <Comment
                comment={reply}
                currentUserName={currentUserName}
                isReply
                key={reply.id}
                onReply={onReply}
                onToggleLike={onToggleLike}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
