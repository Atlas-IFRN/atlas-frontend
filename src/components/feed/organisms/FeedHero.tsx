import { useEffect, useState } from 'react'
import { ButtonLink } from '../../atoms/ButtonLink'
import atlasMark from '../../../assets/brand/atlas-logo.svg'
import type { FeedHeroSlide } from '../types'

interface FeedHeroProps {
  slides: FeedHeroSlide[]
  /** Intervalo do autoplay em ms. Use 0 para desativar. */
  intervalMs?: number
}

/** Carrossel de destaques no topo do feed. */
export function FeedHero({ slides, intervalMs = 7000 }: FeedHeroProps) {
  const [index, setIndex] = useState(0)
  const count = slides.length

  useEffect(() => {
    if (!intervalMs || count <= 1) {
      return
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count)
    }, intervalMs)

    return () => window.clearInterval(timer)
  }, [count, intervalMs])

  if (count === 0) {
    return null
  }

  const activeTheme = slides[index]?.theme ?? 'blue'

  return (
    <section
      className={`feed-hero feed-hero--${activeTheme}`}
      aria-roledescription="carrossel"
    >
      <div className="feed-hero__bg" aria-hidden="true">
        <img alt="" className="feed-hero__mark" src={atlasMark} />
        <div className="feed-hero__grid" />
      </div>

      <div
        className="feed-hero__track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide) => (
          <div className="feed-hero__slide" key={slide.id}>
            <div className="feed-hero__content">
              <span className="feed-hero__eyebrow">
                <span className="feed-hero__dot" />
                {slide.eyebrow}
              </span>

              <h2 className="feed-hero__title">
                {slide.title}
                <br />
                <em>{slide.titleAccent}</em>
              </h2>

              <p className="feed-hero__desc">{slide.description}</p>

              <div className="feed-hero__actions">
                {slide.actions.map((action) => (
                  <ButtonLink
                    key={action.label}
                    size="sm"
                    to={action.href}
                    variant={action.variant === 'primary' ? 'primary' : 'soft'}
                  >
                    {action.label}
                  </ButtonLink>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {count > 1 ? (
        <div className="feed-hero__dots" role="tablist" aria-label="Destaques">
          {slides.map((slide, dotIndex) => (
            <button
              aria-label={`Slide ${dotIndex + 1}`}
              aria-selected={dotIndex === index}
              className={`feed-hero__dot-btn${
                dotIndex === index ? ' feed-hero__dot-btn--active' : ''
              }`}
              key={slide.id}
              onClick={() => setIndex(dotIndex)}
              role="tab"
              type="button"
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
