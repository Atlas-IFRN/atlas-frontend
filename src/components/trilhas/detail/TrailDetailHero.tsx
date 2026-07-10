import { StatusBadge } from '../../atoms/StatusBadge'
import { TextTag } from '../../atoms/TextTag'
import type { Trail } from '../../../types/tracks'

interface TrailDetailHeroProps {
  trail: Trail
}

export function TrailDetailHero({ trail }: TrailDetailHeroProps) {
  return (
    <section className={`trail-detail-hero ${trail.theme}`}>
      <div className="trail-detail-hero__content">
        <div className="trail-detail-hero__badges">
          <TextTag size="sm">{trail.area}</TextTag>
          {trail.isNew ? (
            <StatusBadge status="primary" size="sm">
              Nova
            </StatusBadge>
          ) : null}
        </div>
        <h1>{trail.title}</h1>
        <p>{trail.description}</p>
        <div className="trail-detail-hero__skills">
          {trail.skills.map((skill) => (
            <TextTag key={skill} size="sm" variant="subtle">
              {skill}
            </TextTag>
          ))}
        </div>
      </div>
    </section>
  )
}
