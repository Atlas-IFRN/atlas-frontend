import { Fragment, type ReactNode } from 'react'

/**
 * Converte texto simples em nós React, destacando #hashtags, @menções e
 * trechos de `código`. Mantém quebras de parágrafo (linha em branco dupla).
 *
 * Sem dependências externas e sem HTML perigoso: cada token vira um elemento
 * controlado. Fácil de trocar por um parser real quando houver backend.
 */
const TOKEN_PATTERN = /(`[^`]+`|[#@][\p{L}\p{N}_]+)/gu

function renderInline(text: string): ReactNode[] {
  const parts = text.split(TOKEN_PATTERN)

  return parts.filter(Boolean).map((part, index) => {
    const key = `${index}-${part}`

    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={key}>{part.slice(1, -1)}</code>
    }

    if (part.startsWith('#')) {
      return (
        <span className="post-tag" key={key}>
          {part}
        </span>
      )
    }

    if (part.startsWith('@')) {
      return (
        <span className="post-mention" key={key}>
          {part}
        </span>
      )
    }

    return <Fragment key={key}>{part}</Fragment>
  })
}

export function renderRichText(content: string): ReactNode {
  const paragraphs = content.split(/\n{2,}/)

  return paragraphs.map((paragraph, index) => (
    <p key={index}>{renderInline(paragraph)}</p>
  ))
}
