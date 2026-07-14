import type { ReactNode } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { Avatar } from '../../atoms/Avatar'
import { StatusBadge } from '../../atoms/StatusBadge'
import type { FeedAuthor } from '../../../types/feed'

interface PostHeaderProps {
  author: FeedAuthor
  time: string
  /** Substitui o botão "mais opções" estático por um menu conectado. */
  menu?: ReactNode
  /** Torna nome/avatar clicáveis (ex.: link para o perfil do autor). */
  onAuthorClick?: () => void
}

export function PostHeader({ author, time, menu, onAuthorClick }: PostHeaderProps) {
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
          {onAuthorClick ? (
            <button
              className="post-head__author-link"
              onClick={onAuthorClick}
              type="button"
            >
              {author.name}
            </button>
          ) : (
            <strong>{author.name}</strong>
          )}
          {author.badge ? (
            <StatusBadge size="sm" status="primary">
              {author.badge}
            </StatusBadge>
          ) : null}
        </div>
        <span className="post-head__role">{author.role}</span>
      </div>

      <span className="post-head__time">{time}</span>

      {menu ?? (
        <button
          className="post-head__menu"
          type="button"
          aria-label="Mais opções"
        >
          <MoreHorizontal aria-hidden="true" size={18} strokeWidth={2} />
        </button>
      )}
    </header>
  )
}
