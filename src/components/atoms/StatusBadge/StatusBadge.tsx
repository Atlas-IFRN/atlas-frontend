import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import './StatusBadge.css'

export type StatusBadgeStatus =
  | 'primary'
  | 'completed'
  | 'in-progress'
  | 'success'
  | 'warning'
  | 'danger'
  | 'pink'
  | 'neutral'
  | 'active'
  | 'inactive'
  | 'pending'
  | 'approved'
  | 'rejected'

export type StatusBadgeSize = 'sm' | 'md'

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: StatusBadgeStatus
  size?: StatusBadgeSize
}

const statusLabels = {
  primary: 'Primary',
  completed: 'Completed',
  'in-progress': 'In Progress',
  success: 'Success',
  warning: 'Warning',
  danger: 'Danger',
  pink: 'Pink',
  neutral: 'Neutral',
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
} satisfies Record<StatusBadgeStatus, string>

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  function StatusBadge(
    {
      status,
      size = 'md',
      children,
      className,
      role = 'status',
      ...props
    },
    ref,
  ) {
    const badgeClassName = [
      'atlas-status-badge',
      `atlas-status-badge--${status}`,
      `atlas-status-badge--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <span
        {...props}
        ref={ref}
        className={badgeClassName}
        role={role}
        data-status={status}
      >
        {children ?? statusLabels[status]}
      </span>
    )
  },
)

StatusBadge.displayName = 'StatusBadge'
