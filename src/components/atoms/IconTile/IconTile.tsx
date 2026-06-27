import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Icon } from '../../ui/Icon'
import type { IconName } from '../../ui/Icon'
import './IconTile.css'

export type IconTileSize = 'sm' | 'md' | 'lg'
export type IconTileVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'

type IconTileBaseProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  size?: IconTileSize
  variant?: IconTileVariant
}

type IconTileWithComponent = {
  icon: LucideIcon
  name?: never
}

type IconTileWithName = {
  icon?: never
  name: IconName
}

export type IconTileProps = IconTileBaseProps &
  (IconTileWithComponent | IconTileWithName)

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
} satisfies Record<IconTileSize, number>

export const IconTile = forwardRef<HTMLSpanElement, IconTileProps>(
  function IconTile(
    {
      icon: IconComponent,
      name,
      size = 'md',
      variant = 'primary',
      className,
      role,
      title,
      'aria-hidden': ariaHidden,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...props
    },
    ref,
  ) {
    const tileClassName = [
      'atlas-icon-tile',
      `atlas-icon-tile--${variant}`,
      `atlas-icon-tile--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    const hasAccessibleName = Boolean(ariaLabel || ariaLabelledBy || title)
    const isExplicitlyHidden = ariaHidden === true || ariaHidden === 'true'
    const isExplicitlyVisible = ariaHidden === false || ariaHidden === 'false'
    const isDecorative =
      isExplicitlyHidden || (!isExplicitlyVisible && !hasAccessibleName)

    const accessibleRole =
      role ?? (hasAccessibleName && !isDecorative ? 'img' : undefined)

    return (
      <span
        {...props}
        ref={ref}
        className={tileClassName}
        role={accessibleRole}
        title={title}
        aria-hidden={isDecorative ? true : ariaHidden}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        data-variant={variant}
        data-size={size}
      >
        {IconComponent ? (
          <IconComponent
            aria-hidden="true"
            className="atlas-icon-tile__icon"
            focusable="false"
            size={iconSizes[size]}
            strokeWidth={1.85}
          />
        ) : (
          <Icon
            aria-hidden="true"
            className="atlas-icon-tile__icon"
            focusable="false"
            name={name}
            size={iconSizes[size]}
            strokeWidth={1.85}
          />
        )}
      </span>
    )
  },
)

IconTile.displayName = 'IconTile'
