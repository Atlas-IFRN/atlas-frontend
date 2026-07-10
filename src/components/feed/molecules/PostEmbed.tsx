import { Play } from 'lucide-react'
import type { PostEmbed as PostEmbedData } from '../types'

interface PostEmbedProps {
  embed: PostEmbedData
}

/** Card de conteúdo interno referenciado por um post (trilha, módulo). */
export function PostEmbed({ embed }: PostEmbedProps) {
  const tone = embed.tone ?? 'success'

  return (
    <div className="post-embed">
      <span
        aria-hidden="true"
        className={`post-embed__icon post-embed__icon--${tone}`}
      >
        <Play size={18} strokeWidth={2} />
      </span>

      <div className="post-embed__info">
        <span className="post-embed__eyebrow">{embed.eyebrow}</span>
        <strong className="post-embed__title">{embed.title}</strong>
        <span className="post-embed__meta">{embed.meta}</span>
      </div>
    </div>
  )
}
