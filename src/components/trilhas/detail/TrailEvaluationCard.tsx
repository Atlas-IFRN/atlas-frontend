import { CheckCircle2, XCircle } from 'lucide-react'
import { StatusBadge } from '../../atoms/StatusBadge'
import type { Trail } from '../../../types/tracks'

interface TrailEvaluationCardProps {
  evaluation: Trail['evaluation']
}

function getEvaluationStatus(status: string) {
  const normalizedStatus = status
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')

  if (normalizedStatus.includes('aprov')) {
    return 'approved'
  }

  if (normalizedStatus.includes('reprov') || normalizedStatus.includes('reject')) {
    return 'rejected'
  }

  return 'pending'
}

export function TrailEvaluationCard({ evaluation }: TrailEvaluationCardProps) {
  if (!evaluation) {
    return (
      <section className="trail-detail-section">
        <h2>Avaliação</h2>
        <p>
          Nenhuma avaliação automatizada foi registrada para esta trilha ainda.
        </p>
      </section>
    )
  }

  return (
    <section className="trail-detail-section trail-evaluation-card">
      <div className="trail-evaluation-card__header">
        <h2>Última avaliação IA</h2>
        <StatusBadge status={getEvaluationStatus(evaluation.status)} size="sm">
          {evaluation.status}
        </StatusBadge>
      </div>

      <div className="trail-evaluation-card__score">
        <strong>{evaluation.score}</strong>
        <span>/100</span>
      </div>

      <dl className="trail-evaluation-card__meta">
        <div>
          <dt>Desafio avaliado</dt>
          <dd>{evaluation.challenge}</dd>
        </div>
        <div>
          <dt>Módulo</dt>
          <dd>{evaluation.module}</dd>
        </div>
      </dl>

      <div className="trail-evaluation-card__counts">
        <span>{evaluation.attended} atendidos</span>
        <span>{evaluation.pending} pendentes</span>
        <span>{evaluation.criteria} critérios</span>
      </div>

      {evaluation.checks.length > 0 ? (
        <ul className="trail-evaluation-card__checks">
          {evaluation.checks.map((check) => (
            <li key={check.label} data-status={check.status}>
              {check.status === 'danger' ? (
                <XCircle aria-hidden="true" size={14} />
              ) : (
                <CheckCircle2 aria-hidden="true" size={14} />
              )}
              <span>{check.label}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
