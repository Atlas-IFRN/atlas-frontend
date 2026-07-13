import { useRef, useState, type ChangeEvent } from 'react'
import { ImagePlus, Link2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, type AvatarColor } from '../../atoms/Avatar'
import { Button } from '../../atoms/Button'
import { useCreatePost } from '../../../hooks/useFeed'
import { getFeedRequestErrorMessage } from '../../../services/feed'

export interface FeedComposerProps {
  currentUserName: string
  currentUserColor?: AvatarColor
  currentUserAvatar?: string
  /** Chamado após publicar com sucesso (ex.: navegar de volta ao feed). */
  onPublished?: () => void
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

function normalizeUrl(raw: string): string | null {
  const value = raw.trim()
  if (!value) {
    return null
  }
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`
  try {
    // Valida antes de enviar.
    new URL(withScheme)
    return withScheme
  } catch {
    return null
  }
}

/** Caixa de composição conectada ao feed-service (texto + imagem + link). */
export function FeedComposer({
  currentUserName,
  currentUserColor = 'blue',
  currentUserAvatar,
  onPublished,
}: FeedComposerProps) {
  const [content, setContent] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [linkOpen, setLinkOpen] = useState(false)
  const [link, setLink] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const createPost = useCreatePost()
  const trimmed = content.trim()
  const canPublish =
    Boolean(trimmed || image || link.trim()) && !createPost.isPending

  function handlePickImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem.')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('A imagem deve ter no máximo 5 MB.')
      return
    }
    setImage(file)
    setImagePreview((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous)
      }
      return URL.createObjectURL(file)
    })
  }

  function clearImage() {
    setImage(null)
    setImagePreview((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous)
      }
      return null
    })
  }

  function reset() {
    setContent('')
    setLink('')
    setLinkOpen(false)
    clearImage()
  }

  function handlePublish() {
    if (!canPublish) {
      return
    }

    let embedLink: { url: string } | null = null
    if (link.trim()) {
      const url = normalizeUrl(link)
      if (!url) {
        toast.error('Informe um link válido.')
        return
      }
      embedLink = { url }
    }

    createPost.mutate(
      { content: trimmed, image, embedLink },
      {
        onSuccess: () => {
          reset()
          toast.success('Publicação criada!')
          onPublished?.()
        },
        onError: (error) =>
          toast.error(
            getFeedRequestErrorMessage(error, 'Não foi possível publicar.'),
          ),
      },
    )
  }

  return (
    <div className="composer">
      <div className="composer__top">
        <Avatar
          color={currentUserColor}
          name={currentUserName}
          size="sm"
          src={currentUserAvatar}
        />
        <textarea
          onChange={(event) => setContent(event.target.value)}
          placeholder="Compartilhe um link, aprendizado ou dica com a comunidade…"
          value={content}
        />
      </div>

      {imagePreview ? (
        <div className="composer__image-preview">
          <img alt="Prévia da imagem selecionada" src={imagePreview} />
          <button
            aria-label="Remover imagem"
            className="composer__image-remove"
            onClick={clearImage}
            type="button"
          >
            <X aria-hidden="true" size={16} strokeWidth={2} />
          </button>
        </div>
      ) : null}

      {linkOpen ? (
        <input
          className="composer__link-input"
          onChange={(event) => setLink(event.target.value)}
          placeholder="Cole um link (https://…)"
          type="url"
          value={link}
        />
      ) : null}

      <div className="composer__foot">
        <Button
          iconLeft={Link2}
          onClick={() => setLinkOpen((open) => !open)}
          size="sm"
          variant={linkOpen ? 'soft' : 'ghost'}
        >
          Link
        </Button>
        <Button
          iconLeft={ImagePlus}
          onClick={() => fileInputRef.current?.click()}
          size="sm"
          variant={image ? 'soft' : 'ghost'}
        >
          Mídia
        </Button>
        <input
          accept="image/*"
          hidden
          onChange={handlePickImage}
          ref={fileInputRef}
          type="file"
        />

        <span className="composer__spacer" />

        <Button
          disabled={!canPublish}
          onClick={handlePublish}
          size="sm"
          variant="primary"
        >
          {createPost.isPending ? 'Publicando…' : 'Publicar'}
        </Button>
      </div>
    </div>
  )
}
