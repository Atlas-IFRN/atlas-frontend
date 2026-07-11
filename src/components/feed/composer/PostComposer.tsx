import { useState } from 'react'
import { ImagePlus, Link2 } from 'lucide-react'
import { Avatar, type AvatarColor } from '../../atoms/Avatar'
import { Button } from '../../atoms/Button'

export interface PostComposerProps {
  currentUserName: string
  currentUserColor?: AvatarColor
  onPublish?: (content: string) => void
}

/** Caixa de composição para publicar no feed. */
export function PostComposer({
  currentUserName,
  currentUserColor = 'blue',
  onPublish,
}: PostComposerProps) {
  const [value, setValue] = useState('')
  const trimmed = value.trim()

  function handlePublish() {
    if (!trimmed) {
      return
    }

    onPublish?.(trimmed)
    setValue('')
  }

  return (
    <div className="composer">
      <div className="composer__top">
        <Avatar color={currentUserColor} name={currentUserName} size="sm" />
        <textarea
          onChange={(event) => setValue(event.target.value)}
          placeholder="Compartilhe um link, aprendizado ou dica com a comunidade…"
          value={value}
        />
      </div>

      <div className="composer__foot">
        <Button iconLeft={Link2} size="sm" variant="ghost">
          Link
        </Button>
        <Button iconLeft={ImagePlus} size="sm" variant="ghost">
          Mídia
        </Button>

        <span className="composer__spacer" />

        <Button
          disabled={!trimmed}
          onClick={handlePublish}
          size="sm"
          variant="primary"
        >
          Publicar
        </Button>
      </div>
    </div>
  )
}
