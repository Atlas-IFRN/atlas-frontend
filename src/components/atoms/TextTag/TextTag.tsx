import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import './TextTag.css'

export type TextTagSize = 'sm' | 'md'
export type TextTagVariant =
  | 'default'
  | 'outline'
  | 'subtle'
  | 'hard-skill'
  | 'soft-skill'

export interface TextTagProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  size?: TextTagSize
  variant?: TextTagVariant
  withDot?: boolean
}

export const TextTag = forwardRef<HTMLSpanElement, TextTagProps>(
  function TextTag(
    {
      children,
      size = 'md',
      variant = 'default',
      withDot = false,
      className,
      ...props
    },
    ref,
  ) {
    const tagClassName = [
      'atlas-text-tag',
      `atlas-text-tag--${variant}`,
      `atlas-text-tag--${size}`,
      withDot ? 'atlas-text-tag--dot' : undefined,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <span {...props} ref={ref} className={tagClassName}>
        {children}
      </span>
    )
  },
)

TextTag.displayName = 'TextTag'
