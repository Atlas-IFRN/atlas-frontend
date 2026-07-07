import { Link } from 'react-router-dom'
import { ProgressBar } from '../../atoms/ProgressBar'
import type { Trail } from '../../../pages/tracks/trailsData'
import { TrailBanner } from '../molecules/TrailBanner'
import { TrailFooterMeta } from '../molecules/TrailFooterMeta'
import { TrailSkillList } from '../molecules/TrailSkillList'

interface TrailCardProps {
  trail: Trail
}

export function TrailCard({ trail }: TrailCardProps) {
  return (
    <article className="trail-card">
      <Link
        aria-label={`Abrir trilha ${trail.title}`}
        className="trail-card__content-link"
        to={`/trilhas/${trail.id}`}
      >
        <TrailBanner trail={trail} />

        <div className="trail-card__body">
          <h2>{trail.title}</h2>
          <TrailSkillList skills={trail.skills} />
          <p>{trail.description}</p>

          {trail.progress !== null ? (
            <ProgressBar label="Progresso" value={trail.progress} />
          ) : null}
        </div>
      </Link>

      <TrailFooterMeta trail={trail} />
    </article>
  )
}
