import { Avatar } from '../../atoms/Avatar'
import { Text } from '../../atoms/Text'
import styles from './UserChip.module.css'
import type { UserChipProps } from './UserChip.types'

/**
 * Molecule that composes Avatar and Text atoms into a compact user identity chip.
 */
export function UserChip({
  name,
  role,
  src,
  color = 'blue',
  size = 'md',
  className,
}: UserChipProps) {
  const classNames = [
    styles.chip,
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classNames}>
      <Avatar name={name} src={src} color={color} size={size} />
      <span className={styles.content} data-user-chip-content>
        <Text variant="name" data-user-chip-name>
          {name}
        </Text>
        {role ? (
          <Text variant="role" data-user-chip-role>
            {role}
          </Text>
        ) : null}
      </span>
    </div>
  )
}
