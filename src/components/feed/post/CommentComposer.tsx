import { useState } from 'react'
import { Avatar, type AvatarColor } from '../../atoms/Avatar'
import { Button } from '../../atoms/Button'

export interface CommentComposerProps {
  currentUserName: string
  currentUserColor?: AvatarColor
  currentUserAvatar?: string
  placeholder?: string
  submitLabel?: string
  autoFocus?: boolean
  compact?: boolean
  onSubmit: (content: string) => void
  onCancel?: () => void
}

export function CommentComposer({
  currentUserName,
  currentUserColor = 'blue',
  currentUserAvatar,
  placeholder = 'Escreva um comentário…',
  submitLabel = 'Comentar',
  autoFocus = false,
  compact = false,
  onSubmit,
  onCancel,
}: CommentComposerProps) {
  const [value, setValue] = useState('')
  const trimmed = value.trim()

  function handleSubmit() {
    if (!trimmed) {
      return
    }

    onSubmit(trimmed)
    setValue('')
  }

  return (
    <div className={`comment-composer${compact ? ' comment-composer--compact' : ''}`}>
      <Avatar
        color={currentUserColor}
        name={currentUserName}
        size="sm"
        src={currentUserAvatar}
      />

      <div className="comment-composer__field">
        <textarea
          autoFocus={autoFocus}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          rows={compact ? 1 : 2}
          value={value}
        />

        <div className="comment-composer__actions">
          {onCancel ? (
            <Button onClick={onCancel} size="sm" variant="ghost">
              Cancelar
            </Button>
          ) : null}
          <Button
            disabled={!trimmed}
            onClick={handleSubmit}
            size="sm"
            variant="primary"
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
