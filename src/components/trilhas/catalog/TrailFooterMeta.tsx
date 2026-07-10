import { Link } from 'react-router-dom'
import { Clock, Layers } from 'lucide-react'
import { ButtonLink } from '../../atoms/ButtonLink'
import type { Trail } from '../../../types/tracks'

interface TrailFooterMetaProps {
  trail: Trail
}

export function TrailFooterMeta({ trail }: TrailFooterMetaProps) {
  const ctaLabel = trail.enrolled ? 'Continuar' : 'Inscrever-se'

  return (
    <footer className="trail-footer-meta">
      <Link
        aria-label={`Abrir trilha ${trail.title}`}
        className="trail-footer-meta__items"
        to={`/trilhas/${trail.id}`}
      >
        <span>
          <Layers aria-hidden="true" size={15} strokeWidth={1.8} />
          {trail.modules} módulos
        </span>
        <span>
          <Clock aria-hidden="true" size={15} strokeWidth={1.8} />~
          {trail.hours}h
        </span>
      </Link>

      <ButtonLink
        className="trail-footer-meta__cta"
        size="md"
        to={`/trilhas/${trail.id}`}
        variant={trail.enrolled ? 'primary' : 'soft'}
      >
        {ctaLabel}
      </ButtonLink>
    </footer>
  )
}
