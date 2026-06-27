import type { HTMLAttributes, ReactNode } from 'react'
import { FileSearch, type LucideIcon } from 'lucide-react'
import { Button } from '../../atoms/Button'
import './EmptyState.css'

export interface EmptyStateProps extends HTMLAttributes<HTMLElement> {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  action?: ReactNode
}

export function EmptyState({
  icon: Icon = FileSearch,
  title,
  description,
  actionLabel,
  onAction,
  action,
  className,
  role = 'status',
  'aria-live': ariaLive = 'polite',
  ...props
}: EmptyStateProps) {
  const emptyClassName = ['atlas-empty-state', className]
    .filter(Boolean)
    .join(' ')

  const hasDefaultAction = actionLabel && onAction

  return (
    <section
      {...props}
      className={emptyClassName}
      role={role}
      aria-live={ariaLive}
    >
      <span className="atlas-empty-state__icon" aria-hidden="true">
        <Icon size={34} strokeWidth={1.8} />
      </span>

      <div className="atlas-empty-state__content">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>

      {action ?? (hasDefaultAction ? (
        <Button size="lg" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null)}
    </section>
  )
}
