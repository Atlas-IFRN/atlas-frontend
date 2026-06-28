import type { AvatarColor, AvatarSize } from '../../atoms/Avatar'

export interface UserChipProps {
  name: string
  role?: string
  src?: string
  color?: AvatarColor
  size?: AvatarSize
  className?: string
}
