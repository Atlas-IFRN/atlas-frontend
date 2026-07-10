import { useState } from 'react'
import { renderRichText } from './richText'

interface PostBodyProps {
  content: string
  /** Habilita o corte com "ver mais". Usado nos posts de texto longo. */
  expandable?: boolean
  /** Nº de caracteres antes do corte quando `expandable`. */
  clampAt?: number
}

export function PostBody({
  content,
  expandable = false,
  clampAt = 280,
}: PostBodyProps) {
  const [expanded, setExpanded] = useState(false)

  const shouldClamp = expandable && content.length > clampAt && !expanded

  if (!shouldClamp) {
    return (
      <div className="post-body">
        {renderRichText(content)}

        {expandable && expanded ? (
          <button
            className="post-more"
            onClick={() => setExpanded(false)}
            type="button"
          >
            Ver menos
          </button>
        ) : null}
      </div>
    )
  }

  const preview = `${content.slice(0, clampAt).trimEnd()}…`

  return (
    <div className="post-body">
      {renderRichText(preview)}

      <button
        className="post-more"
        onClick={() => setExpanded(true)}
        type="button"
      >
        Ver tudo
      </button>
    </div>
  )
}
