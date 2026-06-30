import type { HTMLAttributes } from 'react'
import './LoadingState.css'

export type LoadingStateVariant = 'skeleton' | 'spinner'

export interface LoadingStateProps extends HTMLAttributes<HTMLDivElement> {
  variant?: LoadingStateVariant
  message?: string
  skeletonCount?: number
}

export function LoadingState({
  variant = 'skeleton',
  message,
  skeletonCount = 3,
  className,
  'aria-live': ariaLive = 'polite',
  ...props
}: LoadingStateProps) {
  const loadingClassName = [
    'atlas-loading-state',
    `atlas-loading-state--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const skeletonItems = Array.from(
    { length: Math.max(1, skeletonCount) },
    (_, index) => index,
  )

  return (
    <div
      {...props}
      className={loadingClassName}
      role="status"
      aria-busy="true"
      aria-live={ariaLive}
    >
      {variant === 'skeleton' ? (
        <div className="atlas-loading-state__skeleton-grid" aria-hidden="true">
          {skeletonItems.map((item) => (
            <span className="atlas-loading-state__skeleton-card" key={item} />
          ))}
        </div>
      ) : (
        <span className="atlas-loading-state__spinner" aria-hidden="true" />
      )}

      {message ? (
        <p className="atlas-loading-state__message">{message}</p>
      ) : (
        <span className="atlas-loading-state__sr-only">Carregando</span>
      )}
    </div>
  )
}
