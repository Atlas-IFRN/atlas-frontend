import { Link, type LinkProps } from 'react-router-dom'
import type { ButtonSize, ButtonVariant } from '../Button'
import '../Button/Button.css'

export interface ButtonLinkProps extends LinkProps {
  size?: ButtonSize
  variant?: ButtonVariant
}

export function ButtonLink({
  children,
  className,
  size = 'md',
  variant = 'primary',
  ...props
}: ButtonLinkProps) {
  const buttonClassName = [
    'atlas-button',
    `atlas-button--${variant}`,
    `atlas-button--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Link {...props} className={buttonClassName}>
      {children}
    </Link>
  )
}
