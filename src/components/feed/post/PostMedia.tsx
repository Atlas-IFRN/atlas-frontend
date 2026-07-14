import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ImageIcon, X } from 'lucide-react'
import type { PostMedia as PostMediaData } from '../../../types/feed'

interface PostMediaProps {
  media: PostMediaData
}

/**
 * Renderiza a imagem do post. Quando não há `src` (caso dos dados de exemplo),
 * mostra um placeholder por tom. Com `src`, a imagem é clicável e abre um
 * lightbox (modal) para ver em tamanho maior.
 */
export function PostMedia({ media }: PostMediaProps) {
  const tone = media.tone ?? 'blue'
  const [zoomed, setZoomed] = useState(false)

  useEffect(() => {
    if (!zoomed) {
      return
    }
    // Fecha no Esc e trava o scroll do fundo enquanto o modal está aberto.
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setZoomed(false)
      }
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [zoomed])

  return (
    <figure className="post-media">
      {media.src ? (
        <button
          aria-label="Ampliar imagem"
          className="post-media__zoom"
          onClick={() => setZoomed(true)}
          type="button"
        >
          <img alt={media.alt} loading="lazy" src={media.src} />
        </button>
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

      {zoomed && media.src
        ? createPortal(
            <div
              aria-label={media.alt}
              aria-modal="true"
              className="image-lightbox"
              onClick={() => setZoomed(false)}
              role="dialog"
            >
              <button
                aria-label="Fechar"
                className="image-lightbox__close"
                onClick={() => setZoomed(false)}
                type="button"
              >
                <X aria-hidden="true" size={22} strokeWidth={2} />
              </button>
              <img
                alt={media.alt}
                className="image-lightbox__img"
                onClick={(event) => event.stopPropagation()}
                src={media.src}
              />
              {media.caption ? (
                <figcaption className="image-lightbox__caption">
                  {media.caption}
                </figcaption>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </figure>
  )
}
