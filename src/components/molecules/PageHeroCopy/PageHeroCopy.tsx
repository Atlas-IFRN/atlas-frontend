import type { HTMLAttributes, ReactNode } from 'react'
import './PageHeroCopy.css'

export type PageHeroCopySize = 'md' | 'lg'

export interface PageHeroCopyProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  description?: ReactNode
  eyebrow: ReactNode
  size?: PageHeroCopySize
  title: ReactNode
  titleId?: string
}

export function PageHeroCopy({
  className,
  description,
  eyebrow,
  size = 'md',
  title,
  titleId,
  ...props
}: PageHeroCopyProps) {
  const copyClassName = [
    'atlas-page-hero-copy',
    `atlas-page-hero-copy--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div {...props} className={copyClassName}>
      <span className="atlas-page-hero-copy__eyebrow">{eyebrow}</span>
      <h1 className="atlas-page-hero-copy__title" id={titleId}>
        {title}
      </h1>
      {description ? (
        <p className="atlas-page-hero-copy__description">{description}</p>
      ) : null}
    </div>
  )
}

export default PageHeroCopy
