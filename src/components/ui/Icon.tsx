import { Home, type LucideIcon, type LucideProps } from 'lucide-react'

const icons = {
  Home,
} satisfies Record<string, LucideIcon>

export type IconName = keyof typeof icons

type IconProps = Omit<LucideProps, 'ref'> & {
  name: IconName
}

export function Icon({
  name,
  size = 18,
  strokeWidth = 1.75,
  ...props
}: IconProps) {
  const LucideIcon = icons[name]

  return <LucideIcon size={size} strokeWidth={strokeWidth} {...props} />
}
