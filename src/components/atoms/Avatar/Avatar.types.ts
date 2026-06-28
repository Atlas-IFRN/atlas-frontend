import type { ComponentPropsWithoutRef } from 'react'

export type AvatarColor = 'blue' | 'teal' | 'purple' | 'amber' | 'pink'

export type AvatarSize = 'sm' | 'md' | 'lg'

export interface AvatarProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  name: string
  src?: string
  color?: AvatarColor
  size?: AvatarSize
}
