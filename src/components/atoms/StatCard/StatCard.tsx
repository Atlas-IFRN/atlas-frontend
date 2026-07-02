import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Icon } from '../../ui/Icon'
import type { IconName } from '../../ui/Icon'
import './StatCard.css'

export type StatCardTone = 'primary' | 'teal' | 'purple' | 'amber'

type StatCardBaseProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  actionAriaLabel?: string
  actionHref?: string
  actionLabel?: string
  label: string
  onAction?: () => void
  tone?: StatCardTone
  value: number | string
}

type StatCardWithIcon = {
  icon: LucideIcon
  iconName?: never
}

type StatCardWithIconName = {
  icon?: never
  iconName: IconName
}

export type StatCardProps = StatCardBaseProps &
  (StatCardWithIcon | StatCardWithIconName)

export const StatCard = forwardRef<HTMLElement, StatCardProps>(
  function StatCard(
    {
      actionAriaLabel,
      actionHref,
      actionLabel,
      className,
      icon: IconComponent,
      iconName,
      label,
      onAction,
      tone = 'primary',
      value,
      ...props
    },
    ref,
  ) {
    const cardClassName = [
      'atlas-stat-card',
      `atlas-stat-card--${tone}`,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    const icon = IconComponent ? (
      <IconComponent
        aria-hidden="true"
        className="atlas-stat-card__icon-svg"
        focusable="false"
        size={24}
        strokeWidth={1.9}
      />
    ) : (
      <Icon
        aria-hidden="true"
        className="atlas-stat-card__icon-svg"
        focusable="false"
        name={iconName}
        size={24}
        strokeWidth={1.9}
      />
    )

    const actionContent = actionLabel ? (
      <>
        <span>{actionLabel}</span>
        <ArrowRight
          aria-hidden="true"
          className="atlas-stat-card__action-icon"
          focusable="false"
          size={17}
          strokeWidth={1.85}
        />
      </>
    ) : null

    return (
      <article
        {...props}
        ref={ref}
        className={cardClassName}
        data-interactive={Boolean(actionHref || onAction) || undefined}
      >
        <div className="atlas-stat-card__body">
          <span className="atlas-stat-card__icon" aria-hidden="true">
            {icon}
          </span>

          <div className="atlas-stat-card__content">
            <strong className="atlas-stat-card__value">{value}</strong>
            <span className="atlas-stat-card__label">{label}</span>
          </div>
        </div>

        {actionContent ? (
          <div className="atlas-stat-card__footer">
            {actionHref ? (
              <a
                aria-label={actionAriaLabel}
                className="atlas-stat-card__action"
                href={actionHref}
              >
                {actionContent}
              </a>
            ) : onAction ? (
              <button
                aria-label={actionAriaLabel}
                className="atlas-stat-card__action"
                onClick={onAction}
                type="button"
              >
                {actionContent}
              </button>
            ) : (
              <span className="atlas-stat-card__action atlas-stat-card__action--static">
                {actionContent}
              </span>
            )}
          </div>
        ) : null}
      </article>
    )
  },
)

StatCard.displayName = 'StatCard'
