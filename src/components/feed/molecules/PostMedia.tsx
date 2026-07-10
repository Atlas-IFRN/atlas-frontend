import { ImageIcon } from 'lucide-react'
import type { PostMedia as PostMediaData } from '../types'

interface PostMediaProps {
  media: PostMediaData
}

/**
 * Renderiza a imagem do post. Quando não há `src` (caso dos dados de exemplo),
 * mostra um placeholder por tom — trivial de substituir por uma imagem real.
 */
export function PostMedia({ media }: PostMediaProps) {
  const tone = media.tone ?? 'blue'

  return (
    <figure className="post-media">
      {media.src ? (
        <img alt={media.alt} loading="lazy" src={media.src} />
      ) : (
        <div
          aria-label={media.alt}
          className={`post-media__placeholder post-media__placeholder--${tone}`}
          role="img"
        >
          <ImageIcon aria-hidden="true" size={26} strokeWidth={1.75} />
          {media.caption ? <span>{media.caption}</span> : null}
        </div>
      )}
    </figure>
  )
}
