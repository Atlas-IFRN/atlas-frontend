import type { ReactNode } from 'react'
import { IconTile } from '../../atoms/IconTile'
import type { IconTileVariant } from '../../atoms/IconTile'
import './InfoCard.css'

export type IconTileTone = IconTileVariant

type InfoCardElement = 'section' | 'div' | 'article'

export type InfoCardProps = {
  action?: ReactNode
  as?: InfoCardElement
  children: ReactNode
  className?: string
  eyebrow?: string
  icon?: ReactNode
  iconTone?: IconTileTone
  title: string
}

export function InfoCard({
  action,
  as = 'section',
  children,
  className,
  eyebrow,
  icon,
  iconTone = 'primary',
  title,
}: InfoCardProps) {
  const Component = as
  const hasHeader = Boolean(title || eyebrow || icon || action)
  const cardClassName = ['card', 'card-pad', 'atlas-info-card', className]
    .filter(Boolean)
    .join(' ')

  return (
    <Component className={cardClassName}>
      {hasHeader ? (
        <header className="atlas-info-card__header">
          {icon ? (
            <IconTile aria-hidden="true" variant={iconTone}>
              {icon}
            </IconTile>
          ) : null}

          <div className="atlas-info-card__heading">
            {eyebrow ? (
              <p className="t-caption atlas-info-card__eyebrow">{eyebrow}</p>
            ) : null}
            <h3 className="atlas-info-card__title">{title}</h3>
          </div>

          {action ? (
            <div className="atlas-info-card__action">{action}</div>
          ) : null}
        </header>
      ) : null}

      <div className="atlas-info-card__body">{children}</div>
    </Component>
  )
}

export default InfoCard
