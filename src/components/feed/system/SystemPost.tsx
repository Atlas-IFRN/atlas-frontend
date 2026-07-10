import { Briefcase } from 'lucide-react'
import { ButtonLink } from '../../atoms/ButtonLink'
import type { SystemPost as SystemPostData } from '../../../types/feed'

interface SystemPostProps {
  post: SystemPostData
}

function IfrnMark() {
  return (
    <svg
      aria-hidden="true"
      className="system-post__ifrn-mark"
      fill="none"
      viewBox="0 0 76 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="#fff">
        <circle cx="13" cy="13" r="10" />
        <rect height="20" rx="2" width="20" x="26" y="3" />
        <rect height="20" rx="2" width="20" x="49" y="3" />
        <rect height="20" rx="2" width="20" x="3" y="26" />
        <rect height="20" rx="2" width="20" x="26" y="26" />
        <rect height="20" rx="2" width="20" x="3" y="49" />
        <rect height="20" rx="2" width="20" x="26" y="49" />
        <rect height="20" rx="2" width="20" x="49" y="49" />
        <rect height="20" rx="2" width="20" x="3" y="72" />
        <rect height="20" rx="2" width="20" x="26" y="72" />
      </g>
    </svg>
  )
}

/** Publicação do sistema (bolsa nova, comunicado institucional, etc.). */
export function SystemPost({ post }: SystemPostProps) {
  return (
    <article className={`system-post system-post--${post.tone}`}>
      <div className="system-post__icon" aria-hidden="true">
        {post.tone === 'ifrn' ? (
          <IfrnMark />
        ) : (
          <Briefcase size={18} strokeWidth={2} />
        )}
      </div>

      <div className="system-post__body">
        <span className="system-post__label">{post.label}</span>
        <p
          className="system-post__msg"
          // Mensagem controlada, definida nos dados de exemplo (sem input do usuário).
          dangerouslySetInnerHTML={{ __html: post.message }}
        />

        {post.actionLabel && post.actionHref ? (
          <ButtonLink
            className="system-post__cta"
            size="sm"
            to={post.actionHref}
            variant="soft"
          >
            {post.actionLabel}
          </ButtonLink>
        ) : null}

        <span className="system-post__time">{post.time}</span>
      </div>
    </article>
  )
}
