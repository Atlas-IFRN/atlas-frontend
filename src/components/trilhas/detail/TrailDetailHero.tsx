import { CalendarDays, Gauge, Star, Timer } from 'lucide-react'
import { TextTag } from '../../atoms/TextTag'
import type { Trail } from '../../../types/tracks'
import { TrailSkillList } from '../catalog/TrailSkillList'
import { TrailBannerIcon } from '../catalog/trailBannerIcons'

interface TrailDetailHeroProps {
  trail: Trail
}

export function TrailDetailHero({ trail }: TrailDetailHeroProps) {
  const summary =
    trail.description
      .split(/\r?\n+/)
      .map((paragraph) => paragraph.trim())
      .find(Boolean) ?? trail.description

  return (
    <section className={`trail-detail-hero ${trail.theme}`}>
      <div className="trail-detail-hero__content">
        <TextTag className="trail-banner__area" size="sm" withDot>
          {trail.area}
        </TextTag>

        <h1>{trail.title}</h1>
        <p>{summary}</p>

        {trail.skills.length > 0 ? (
          <div className="trail-detail-hero__skills">
            <TrailSkillList skills={trail.skills} />
          </div>
        ) : null}

        <div className="trail-detail-hero__meta" aria-label="Resumo da trilha">
          <span>
            <CalendarDays aria-hidden="true" size={16} />
            {trail.modules} {trail.modules === 1 ? 'módulo' : 'módulos'}
          </span>
          <span>
            <Timer aria-hidden="true" size={16} />
            {trail.durationLabel}
          </span>
          <span>
            <Gauge aria-hidden="true" size={16} />
            Nível {trail.levelLabel}
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
