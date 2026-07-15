import { forwardRef } from 'react'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import './TechTag.css'

export type TechTagCategory =
  | 'language'
  | 'framework'
  | 'database'
  | 'data-ai'
  | 'infra'
  | 'tool'
export type TechTagVariant = 'outline' | 'tinted' | 'solid'

export interface TechTagProps extends HTMLAttributes<HTMLSpanElement> {
  category: TechTagCategory
  children: ReactNode
  icon?: ReactNode
  variant?: TechTagVariant
  accentColor?: string
}

type TechTagStyle = CSSProperties & {
  '--tech-tag-accent'?: string
}

export const TechTag = forwardRef<HTMLSpanElement, TechTagProps>(
  function TechTag(
    {
      accentColor,
      category,
      children,
      className,
      icon,
      style,
      variant = 'outline',
      ...props
    },
    ref,
  ) {
    const tagClassName = [
      'atlas-tech-tag',
      `atlas-tech-tag--${category}`,
      `atlas-tech-tag--${variant}`,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    const tagStyle: TechTagStyle | undefined = accentColor
      ? { ...style, '--tech-tag-accent': accentColor }
      : style

    return (
      <span
        {...props}
        ref={ref}
        className={tagClassName}
        data-category={category}
        data-variant={variant}
        style={tagStyle}
      >
        {icon ? (
          <span className="atlas-tech-tag__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}

        <span className="atlas-tech-tag__label">{children}</span>
      </span>
    )
  },
)

TechTag.displayName = 'TechTag'
