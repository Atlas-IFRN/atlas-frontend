import { CalendarDays, Star, Timer } from 'lucide-react'
import { TextTag } from '../../atoms/TextTag'
import type { Trail } from '../types'
import { TrailBannerIcon } from '../trailBannerIcons'

interface TrailDetailHeroProps {
  trail: Trail
}

export function TrailDetailHero({ trail }: TrailDetailHeroProps) {
  return (
    <section className={`trail-detail-hero ${trail.theme}`}>
      <div className="trail-detail-hero__content">
        <TextTag className="trail-banner__area" size="sm" withDot>
          {trail.area}
        </TextTag>

        <h1>{trail.title}</h1>
        <p>{trail.description}</p>

        <div className="trail-detail-hero__meta" aria-label="Resumo da trilha">
          <span>
            <CalendarDays aria-hidden="true" size={16} />
            {trail.modules} módulos
          </span>
          <span>
            <Timer aria-hidden="true" size={16} />
            {trail.durationLabel}
          </span>
          <span>
            <Star aria-hidden="true" size={16} />
            Avaliação por IA
          </span>
        </div>
      </div>

      <TrailBannerIcon
        aria-hidden="true"
        className="trail-detail-hero__icon"
        strokeWidth={1.7}
        theme={trail.theme}
      />
    </section>
  )
}
