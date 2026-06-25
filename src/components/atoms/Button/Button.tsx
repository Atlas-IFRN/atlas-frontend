import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'
import './Button.css'

export type ButtonVariant =
  | 'primary'
  | 'outline'
  | 'soft'
  | 'ghost'
  | 'dark'
  | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'pill'

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  iconLeft?: LucideIcon
  iconRight?: LucideIcon
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      iconLeft: IconLeft,
      iconRight: IconRight,
      children,
      className,
      type,
      'aria-busy': ariaBusy,
      'aria-disabled': ariaDisabled,
      ...props
    },
    ref,
  ) {

    // Loading tambem desabilita o botao: enquanto uma acao esta em andamento,
    // evitamos duplo clique, duplo submit e estados concorrentes na interface.
    const isDisabled = disabled || loading

    // Consideramos false/null/undefined como "sem label" para identificar botoes so com icone.
    const hasLabel =
      children !== undefined && children !== null && children !== false

    const isIconOnly = !hasLabel && Boolean(IconLeft || IconRight)

    const buttonClassName = [
      'atlas-button',
      `atlas-button--${variant}`,
      `atlas-button--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        {...props}
        ref={ref}
        className={buttonClassName}
        type={type ?? 'button'}
        disabled={isDisabled}
        aria-busy={loading ? true : ariaBusy}
        aria-disabled={isDisabled ? true : ariaDisabled}
        data-icon-only={isIconOnly || undefined}
        data-loading={loading || undefined}
      >
        {loading ? (
          <span className="atlas-button__spinner" aria-hidden="true" />
        ) : null}

        {!loading && IconLeft ? (
          <IconLeft className="atlas-button__icon" aria-hidden="true" />
        ) : null}

        {hasLabel ? (
          <span className="atlas-button__label">{children}</span>
        ) : null}

        {!loading && IconRight ? (
          <IconRight className="atlas-button__icon" aria-hidden="true" />
        ) : null}
      </button>
    )
  },
)

Button.displayName = 'Button'
