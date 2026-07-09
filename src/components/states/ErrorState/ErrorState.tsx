import type { HTMLAttributes, ReactNode } from 'react'
import { AlertCircle, type LucideIcon } from 'lucide-react'
import { Button } from '../../atoms/Button'
import './ErrorState.css'

export interface ErrorStateProps extends HTMLAttributes<HTMLElement> {
  icon?: LucideIcon
  title?: string
  message: string
  technicalDetail?: string
  retryLabel?: string
  onRetry?: () => void
  action?: ReactNode
}

export function ErrorState({
  icon: Icon = AlertCircle,
  title = 'Não foi possível carregar os dados',
  message,
  technicalDetail,
  retryLabel = 'Tentar novamente',
  onRetry,
  action,
  className,
  role = 'alert',
  'aria-live': ariaLive = 'assertive',
  ...props
}: ErrorStateProps) {
  const errorClassName = ['atlas-error-state', className]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      {...props}
      className={errorClassName}
      role={role}
      aria-live={ariaLive}
    >
      <span className="atlas-error-state__icon" aria-hidden="true">
        <Icon size={32} strokeWidth={1.8} />
      </span>

      <div className="atlas-error-state__content">
        <h2>{title}</h2>
        <p>{message}</p>
      </div>

      {technicalDetail ? (
        <pre className="atlas-error-state__detail">{technicalDetail}</pre>
      ) : null}

      {action ?? (onRetry ? (
        <Button variant="danger" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null)}
    </section>
  )
}
