import { ArrowRight, Info, Star } from 'lucide-react'
import { Button } from '../../atoms/Button'
import { ButtonLink } from '../../atoms/ButtonLink'
import { ProgressBar } from '../../atoms/ProgressBar'
import { StatusBadge } from '../../atoms/StatusBadge'
import { useAuth } from '../../../contexts/AuthContext'
import { useEnrollInTrack } from '../../../hooks/useTracks'
import { getTrackRequestErrorMessage } from '../../../services/tracks'
import type { Trail } from '../../../types/tracks'

interface TrailDetailSidebarProps {
  trail: Trail
}

export function TrailDetailSidebar({ trail }: TrailDetailSidebarProps) {
  const progress = trail.progress ?? 0
  const firstModuleId = trail.modulesList[0]?.id
  const workload = trail.hours > 0 ? `~${trail.hours}h` : 'A definir'
  const { user } = useAuth()
  const enrollment = useEnrollInTrack()
  const normalizedRole = user?.role.trim().toLowerCase()
  const canEnroll = normalizedRole !== 'teacher' && normalizedRole !== 'professor'

  function handleEnroll() {
    enrollment.mutate(trail.id)
  }

  return (
    <aside className="trail-detail-sidebar" aria-label="Progresso da trilha">
      <section className="trail-detail-side-card">
        {trail.enrolled ? (
          <ProgressBar label="Seu progresso" value={progress} />
        ) : null}

        {trail.enrolled && firstModuleId ? (
          <ButtonLink
            className="trail-detail-sidebar__cta"
            size="md"
            to={`/trilhas/${trail.id}/modulos/${firstModuleId}`}
            variant="primary"
          >
            Continuar trilha
          </ButtonLink>
        ) : trail.enrolled ? (
          <Button
            className="trail-detail-sidebar__cta"
            disabled
            size="md"
            variant="primary"
          >
            Trilha sem módulos
          </Button>
        ) : canEnroll ? (
          <Button
            className="trail-detail-sidebar__cta"
            loading={enrollment.isPending}
            onClick={handleEnroll}
            size="md"
            variant="primary"
          >
            Inscrever-se
          </Button>
        ) : firstModuleId ? (
          <ButtonLink
            className="trail-detail-sidebar__cta"
            size="md"
            to={`/trilhas/${trail.id}/modulos/${firstModuleId}`}
            variant="outline"
          >
            Ver primeiro módulo
          </ButtonLink>
        ) : (
          <Button
            className="trail-detail-sidebar__cta"
            disabled
            size="md"
            variant="outline"
          >
            Trilha sem módulos
          </Button>
        )}

        {enrollment.isError ? (
          <p className="trail-detail-sidebar__error" role="alert">
            {getTrackRequestErrorMessage(
              enrollment.error,
              'Não foi possível realizar a inscrição nesta trilha.',
            )}
          </p>
        ) : null}

        <div className="trail-detail-sidebar__stats">
          <span>
            <strong>Módulos</strong>
            {trail.modules}
          </span>
          <span>
            <strong>Carga</strong>
            {workload}
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
            <div><dt>{trail.evaluation.attended}</dt><dd>Atendidos</dd></div>
            <div><dt>{trail.evaluation.pending}</dt><dd>Pendentes</dd></div>
            <div><dt>{trail.evaluation.criteria}</dt><dd>Critérios</dd></div>
          </dl>

          <ul className="trail-ai-score-card__checks">
            {trail.evaluation.checks.map((check, index) => (
              <li data-status={check.status} key={`${check.label}-${index}`}>
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

      <section className="trail-detail-ai-note">
        <Info aria-hidden="true" size={18} strokeWidth={2} />
        <div>
          <strong>Avaliação automática</strong>
          <p>
            Os desafios são validados por IA com base nos critérios definidos
            pelo professor orientador.
          </p>
        </div>
      </section>
    </aside>
  )
}
