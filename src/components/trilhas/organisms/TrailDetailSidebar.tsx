import { ArrowRight, Star } from 'lucide-react'
import { Button } from '../../atoms/Button'
import { ButtonLink } from '../../atoms/ButtonLink'
import { ProgressBar } from '../../atoms/ProgressBar'
import { StatusBadge } from '../../atoms/StatusBadge'
import type { Trail } from '../types'

interface TrailDetailSidebarProps {
  trail: Trail
}

export function TrailDetailSidebar({ trail }: TrailDetailSidebarProps) {
  const progress = trail.progress ?? 0

  return (
    <aside className="trail-detail-sidebar" aria-label="Progresso da trilha">
      <section className="trail-detail-side-card">
        <ProgressBar label="Seu progresso" value={progress} />

        <ButtonLink
          className="trail-detail-sidebar__cta"
          size="md"
          to={`/trilhas/${trail.id}/modulos/${trail.modulesList[0]?.id ?? 'inicio'}`}
          variant="primary"
        >
          Continuar trilha
        </ButtonLink>

        <div className="trail-detail-sidebar__stats">
          <span>
            <strong>Módulos</strong>
            {trail.modules}
          </span>
          <span>
            <strong>Carga</strong>~{trail.hours}h
          </span>
        </div>
      </section>

      {trail.evaluation ? (
        <section className="trail-detail-side-card trail-ai-score-card">
          <div className="trail-ai-score-card__header">
            <span>
              <Star aria-hidden="true" size={14} />
              Última avaliação IA
            </span>
            <StatusBadge size="sm" status="approved">
              {trail.evaluation.status}
            </StatusBadge>
          </div>

          <div className="trail-ai-score-card__score">
            <strong>{trail.evaluation.score}</strong>
            <span>/100</span>
          </div>

          <ProgressBar value={trail.evaluation.score} />

          <div className="trail-ai-score-card__challenge">
            <span>Desafio avaliado</span>
            <strong>{trail.evaluation.challenge}</strong>
            <small>Módulo · {trail.evaluation.module}</small>
          </div>

          <dl className="trail-ai-score-card__metrics">
            <div>
              <dt>{trail.evaluation.attended}</dt>
              <dd>Atendidos</dd>
            </div>
            <div>
              <dt>{trail.evaluation.pending}</dt>
              <dd>Pendentes</dd>
            </div>
            <div>
              <dt>{trail.evaluation.criteria}</dt>
              <dd>Critérios</dd>
            </div>
          </dl>

          <ul className="trail-ai-score-card__checks">
            {trail.evaluation.checks.map((check) => (
              <li data-status={check.status} key={check.label}>
                <span aria-hidden="true" />
                {check.label}
              </li>
            ))}
          </ul>

          <Button iconRight={ArrowRight} size="md" variant="outline">
            Ver avaliação completa
          </Button>
        </section>
      ) : null}
    </aside>
  )
}
