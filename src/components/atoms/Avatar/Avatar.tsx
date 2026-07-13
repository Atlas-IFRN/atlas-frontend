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
  const showImage = Boolean(src) && failedSrc !== src

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
      {showImage ? (
        <img
          className={styles.image}
          src={src}
          alt=""
          onError={() => setFailedSrc(src)}
        />
      ) : (
        getInitials(name)
      )}
    </div>
  )
}
