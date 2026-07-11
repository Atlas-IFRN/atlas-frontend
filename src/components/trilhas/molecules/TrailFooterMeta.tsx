import { Link } from 'react-router-dom'
import { Clock, Layers, Pencil } from 'lucide-react'
import { Button } from '../../atoms/Button'
import { ButtonLink } from '../../atoms/ButtonLink'
import type { Trail } from '../types'

interface TrailFooterMetaProps {
  canEnroll: boolean
  isEnrolling?: boolean
  onEnroll: () => void
  trail: Trail
}

export function TrailFooterMeta({
  canEnroll,
  isEnrolling = false,
  onEnroll,
  trail,
}: TrailFooterMetaProps) {
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

      <div className="trail-footer-meta__actions">
        <ButtonLink
          aria-label={`Editar trilha ${trail.title}`}
          className="trail-footer-meta__cta trail-footer-meta__edit"
          size="md"
          title="Editar trilha"
          to={`/trilhas/${trail.id}/editar`}
          variant="outline"
        >
          <Pencil aria-hidden="true" className="atlas-button__icon" size={15} />
        </ButtonLink>

        {trail.enrolled || !canEnroll ? (
          <ButtonLink
            className="trail-footer-meta__cta"
            size="md"
            to={`/trilhas/${trail.id}`}
            variant={trail.enrolled ? 'primary' : 'soft'}
          >
            {trail.enrolled ? ctaLabel : 'Ver detalhes'}
          </ButtonLink>
        ) : (
          <Button
            className="trail-footer-meta__cta"
            loading={isEnrolling}
            onClick={onEnroll}
            size="md"
            variant="soft"
          >
            {ctaLabel}
          </Button>
        )}
      </div>
    </footer>
  )
}
