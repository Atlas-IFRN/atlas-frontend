import type { HTMLAttributes } from 'react'
import './ProgressBar.css'

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  label?: string
}

function clampProgress(value: number) {
  return Math.min(100, Math.max(0, value))
}

export function ProgressBar({
  value,
  label,
  className,
  ...props
}: ProgressBarProps) {
  const safeValue = clampProgress(value)
  const progressClassName = ['progress', className].filter(Boolean).join(' ')

  return (
    <div
      {...props}
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={safeValue}
      className={progressClassName}
      role="progressbar"
    >
      {label ? (
        <div className="progress__header">
          <span>{label}</span>
          <span className="progress__value">{safeValue}%</span>
        </div>
      ) : null}

      <span className="progress__track" aria-hidden="true">
        <span
          className="progress-bar"
          style={{ inlineSize: `${safeValue}%` }}
        />
      </span>
    </div>
  )
}
