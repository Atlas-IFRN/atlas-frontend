import { Link } from 'react-router-dom'
import { ProgressBar } from '../../atoms/ProgressBar'
import type { Trail } from '../../../types/tracks'
import { TrailBanner } from './TrailBanner'
import { TrailFooterMeta } from './TrailFooterMeta'
import { TrailSkillList } from './TrailSkillList'

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
