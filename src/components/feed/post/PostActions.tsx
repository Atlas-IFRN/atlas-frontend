import { Heart, MessageCircle, Share2 } from 'lucide-react'

export interface PostActionsProps {
  likes: number
  liked: boolean
  commentsCount: number
  shares?: number
  commentsOpen: boolean
  onToggleLike: () => void
  onToggleComments: () => void
}

export function PostActions({
  likes,
  liked,
  commentsCount,
  shares,
  commentsOpen,
  onToggleLike,
  onToggleComments,
}: PostActionsProps) {
  return (
    <div className="post-actions">
      <button
        aria-pressed={liked}
        className={`post-action${liked ? ' post-action--liked' : ''}`}
        onClick={onToggleLike}
        type="button"
      >
        <Heart
          aria-hidden="true"
          fill={liked ? 'currentColor' : 'none'}
          size={15}
          strokeWidth={2}
        />
        {likes}
      </button>

      <button
        aria-expanded={commentsOpen}
        className={`post-action${commentsOpen ? ' post-action--active' : ''}`}
        onClick={onToggleComments}
        type="button"
      >
        <MessageCircle aria-hidden="true" size={15} strokeWidth={2} />
        {commentsCount}{' '}
        {commentsCount === 1 ? 'comentário' : 'comentários'}
      </button>

      <button className="post-action post-action--share" type="button">
        <Share2 aria-hidden="true" size={15} strokeWidth={2} />
        Compartilhar
        {shares ? <span className="post-action__count">{shares}</span> : null}
      </button>
    </div>
  )
}
