import { useState } from 'react'
import styles from './Avatar.module.css'
import type { AvatarProps } from './Avatar.types'

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return ''
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

/**
 * Atom responsible only for rendering a themed circular user avatar.
 */
export function Avatar({
  name,
  src,
  color = 'blue',
  size = 'md',
  className,
  ...props
}: AvatarProps) {
  // Se a imagem falhar ao carregar (URL do SUAP indisponível/protegida),
  // cai para as iniciais em vez de exibir um ícone de imagem quebrada.
  const [failedSrc, setFailedSrc] = useState<string>()
  // Guarda qual `src` já terminou de carregar. As iniciais ficam visíveis
  // por baixo e a foto entra com fade quando pronta — evita o "círculo vazio"
  // enquanto a imagem remota (SUAP) baixa.
  const [loadedSrc, setLoadedSrc] = useState<string>()
  const showImage = Boolean(src) && failedSrc !== src
  const isLoaded = loadedSrc === src

  const classNames = [
    styles.avatar,
    styles[`avatar-${size}`],
    styles[`a-${color}`],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div {...props} className={classNames} role="img" aria-label={name}>
      {getInitials(name)}

      {showImage ? (
        <img
          alt=""
          className={styles.image}
          data-loaded={isLoaded || undefined}
          key={src}
          onError={() => setFailedSrc(src)}
          onLoad={() => setLoadedSrc(src)}
          src={src}
        />
      ) : null}
    </div>
  )
}
