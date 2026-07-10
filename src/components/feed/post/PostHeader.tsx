import { MoreHorizontal } from 'lucide-react'
import { Avatar } from '../../atoms/Avatar'
import { StatusBadge } from '../../atoms/StatusBadge'
import type { FeedAuthor } from '../../../types/feed'

interface PostHeaderProps {
  author: FeedAuthor
  time: string
}

export function PostHeader({ author, time }: PostHeaderProps) {
  return (
    <header className="post-head">
      <Avatar
        color={author.avatarColor ?? 'blue'}
        name={author.name}
        size="sm"
        src={author.avatarSrc}
      />

      <div className="post-head__meta">
        <div className="post-head__author">
          <strong>{author.name}</strong>
          {author.badge ? (
            <StatusBadge size="sm" status="primary">
              {author.badge}
            </StatusBadge>
          ) : null}
        </div>
        <span className="post-head__role">{author.role}</span>
      </div>

      <span className="post-head__time">{time}</span>

      <button className="post-head__menu" type="button" aria-label="Mais opções">
        <MoreHorizontal aria-hidden="true" size={18} strokeWidth={2} />
      </button>
    </header>
  )
}
