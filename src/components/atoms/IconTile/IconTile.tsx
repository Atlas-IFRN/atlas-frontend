import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
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
  children?: never
  icon: LucideIcon
  name?: never
}

type IconTileWithName = {
  children?: never
  icon?: never
  name: IconName
}

type IconTileWithChildren = {
  children: ReactNode
  icon?: never
  name?: never
}

export type IconTileProps = IconTileBaseProps &
  (IconTileWithComponent | IconTileWithName | IconTileWithChildren)

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
      children,
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
    const hasCustomIcon = children !== undefined && children !== null

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
        {hasCustomIcon ? (
          <span className="atlas-icon-tile__icon" aria-hidden="true">
            {children}
          </span>
        ) : IconComponent ? (
          <IconComponent
            aria-hidden="true"
            className="atlas-icon-tile__icon"
            focusable="false"
            size={iconSizes[size]}
            strokeWidth={1.85}
          />
        ) : name ? (
          <Icon
            aria-hidden="true"
            className="atlas-icon-tile__icon"
            focusable="false"
            name={name}
            size={iconSizes[size]}
            strokeWidth={1.85}
          />
        ) : null}
      </span>
    )
  },
)

IconTile.displayName = 'IconTile'
