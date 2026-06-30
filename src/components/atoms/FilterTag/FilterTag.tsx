import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import './FilterTag.css'

export interface FilterTagProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  active?: boolean
  iconLeft?: LucideIcon
  label: ReactNode
}

export const FilterTag = forwardRef<HTMLButtonElement, FilterTagProps>(
  function FilterTag(
    {
      active = false,
      disabled = false,
      iconLeft: IconLeft,
      label,
      className,
      onClick,
      type,
      'aria-pressed': ariaPressed,
      'aria-disabled': ariaDisabled,
      ...props
    },
    ref,
  ) {
    const tagClassName = [
      'atlas-filter-tag',
      active ? 'atlas-filter-tag--active' : 'atlas-filter-tag--default',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      if (disabled) {
        event.preventDefault()
        return
      }

      onClick?.(event)
    }

    return (
      <button
        {...props}
        ref={ref}
        aria-disabled={disabled ? true : ariaDisabled}
        aria-pressed={ariaPressed ?? active}
        className={tagClassName}
        data-active={active || undefined}
        disabled={disabled}
        onClick={handleClick}
        type={type ?? 'button'}
      >
        {IconLeft ? (
          <IconLeft className="atlas-filter-tag__icon" aria-hidden="true" />
        ) : null}

        <span className="atlas-filter-tag__label">{label}</span>
      </button>
    )
  },
)

FilterTag.displayName = 'FilterTag'
