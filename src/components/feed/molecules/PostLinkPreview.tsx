import { ExternalLink, Link2 } from 'lucide-react'
import type { PostLinkPreview as PostLinkPreviewData } from '../types'

interface PostLinkPreviewProps {
  preview: PostLinkPreviewData
}

/** Card de preview para posts que compartilham um link externo. */
export function PostLinkPreview({ preview }: PostLinkPreviewProps) {
  const tone = preview.tone ?? 'blue'

  return (
    <a
      className="post-link-preview"
      href={preview.url}
      rel="noopener noreferrer"
      target="_blank"
    >
      <div
        aria-hidden="true"
        className={`post-link-preview__thumb post-link-preview__thumb--${tone}`}
      >
        <Link2 size={22} strokeWidth={1.75} />
      </div>

      <div className="post-link-preview__body">
        <span className="post-link-preview__domain">
          <ExternalLink aria-hidden="true" size={13} strokeWidth={1.9} />
          {preview.domain}
        </span>
        <strong className="post-link-preview__title">{preview.title}</strong>
        {preview.description ? (
          <p className="post-link-preview__desc">{preview.description}</p>
        ) : null}
      </div>
    </a>
  )
}
