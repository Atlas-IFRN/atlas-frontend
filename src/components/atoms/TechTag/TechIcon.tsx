import type { CSSProperties, SVGProps } from 'react'
import { techIcons, type TechIconName } from './TechIcon.colors'
import './TechTag.css'

export interface TechIconProps
  extends Omit<SVGProps<SVGSVGElement>, 'children' | 'name'> {
  name: TechIconName
}

type TechIconStyle = CSSProperties & {
  '--tech-icon-brand'?: string
}

export function TechIcon({
  name,
  className,
  role,
  style,
  'aria-hidden': ariaHidden,
  'aria-label': ariaLabel,
  ...props
}: TechIconProps) {
  const icon = techIcons[name]
  const iconClassName = [
    'atlas-tech-icon',
    `atlas-tech-icon--${name}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const hiddenState = ariaHidden ?? (ariaLabel ? undefined : true)
  const shouldExposeIcon =
    Boolean(ariaLabel) && hiddenState !== true && hiddenState !== 'true'
  const iconStyle: TechIconStyle = {
    ...style,
    '--tech-icon-brand': `#${icon.hex}`,
  }

  return (
    <svg
      {...props}
      aria-hidden={hiddenState}
      aria-label={shouldExposeIcon ? ariaLabel : undefined}
      className={iconClassName}
      focusable="false"
      role={role ?? (shouldExposeIcon ? 'img' : undefined)}
      style={iconStyle}
      viewBox="0 0 24 24"
    >
      <rect
        className="atlas-tech-icon__background"
        height="24"
        rx="4"
        width="24"
      />
      <path className="atlas-tech-icon__mark" d={icon.path} />
    </svg>
  )
}
