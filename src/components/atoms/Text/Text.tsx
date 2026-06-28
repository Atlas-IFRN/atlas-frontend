import type { ComponentPropsWithoutRef } from 'react'
import styles from './Text.module.css'

export interface TextProps extends ComponentPropsWithoutRef<'span'> {
  variant: 'name' | 'role'
}

/**
 * Atom for the UserChip name and role typography variants.
 */
export function Text({ variant, className, ...props }: TextProps) {
  const classNames = [styles.text, styles[variant], className]
    .filter(Boolean)
    .join(' ')

  return <span {...props} className={classNames} />
}
